'use strict';
const schedule = require('node-schedule');
const logger = require('../utils/logger');
const moment = require('moment');
const _ = require('lodash');

const {sequelize, Challenge: {TYPES}, Sequelize: {Op}} = require('../models');
const apiFootballSdk = require('../lib/apiFootballSDK');
const eventRepository = require('../repositories/eventRepository');
const teamRepository = require('../repositories/teamRepository');
const gameRepository = require('../repositories/gameRepository');
const challengeRepository = require('../repositories/challengeRepository');
const standingRepository = require('../repositories/standingRepository');


async function buildStandingRows(eventId, data, { transaction } = {}) {
    // Collect every unique team fapiId from all groups
    const standings = _.get(data, 'standings');
    const allEntries = _.flatMap(standings, (standing) => standing.table);
    const fapiIds = _.uniq(_.map(allEntries, 'team.id'));
 
    // Resolve fapiId → local teamId in one query
    const dbTeams = await teamRepository.findAllByQuery({ fapiId: fapiIds }, { transaction });
    const fapiToDbId = _.keyBy(dbTeams, 'fapiId'); // { [fapiId]: Team }
 
    const rows = [];
    for (const group of standings) {
        for (const entry of group.table) {
            const fapiId = _.get(entry, 'team.id');
            const dbTeam = fapiToDbId[fapiId];
 
            if (!dbTeam) {
                logger.log('info', `[standings] team fapiId ${fapiId} not found in DB – skipping`);
                continue;
            }
 
            rows.push({
                eventId,
                teamId:       dbTeam.id,
                group:        group.group  || null,
                stage:        group.stage  || null,
                position:     entry.position,
                playedGames:  entry.playedGames,
                won:          entry.won,
                draw:         entry.draw,
                lost:         entry.lost,
                points:       entry.points,
                goalsFor:     entry.goalsFor,
                goalsAgainst: entry.goalsAgainst,
                goalDifference: entry.goalDifference
            });
        }
    }
    return rows;
}

async function mapTeams(fTeams, {transaction}) {
    const fapiId = _.map(fTeams, 'id');
    const existingTeams = await teamRepository.findAllByQuery({fapiId}, {transaction});
    const nonExists = _.differenceWith(fTeams, existingTeams, (fTeam, team) => _.isEqual(fTeam.id, team.fapiId));
    const newTeamsData = _.map(nonExists, ({id: fapiId, name, shortName, tla: code, crestUrl: flag}) => {
        return {fapiId, name, shortName, code, flag};
    });
    const newTeams = await teamRepository.createAll(newTeamsData, {transaction});
    const dbTeams = [...existingTeams, newTeams];
    return _.mapValues(_.keyBy(_.map(dbTeams, ({id, fapiId}) => {
        return {id, fapiId};
    }), 'fapiId'), 'id');
}

function prepareGames(eventId, matches, dbTeamsMap){
    return _.map(matches, match => {
        const {id: fapiId, homeTeam, awayTeam, status, utcDate: playAt, matchday: round} = match;
        const homeTeamId = dbTeamsMap[homeTeam.id];
        const awayTeamId = dbTeamsMap[awayTeam.id];
        return {eventId, round, fapiId, playAt, homeTeamId, awayTeamId, status};
    });
}

function prepareChallenges(games){
    return _.map(games, ({id: refId, playAt, status, factorId}) => {
        return { type: TYPES.FULL_TIME, refName: 'Game', refId, playAt, status, factorId};
    });
}
module.exports = {
    async start() {
        schedule.scheduleJob('* * * * *', async () => {
            const transaction = await sequelize.transaction();
            try {
                const autoEvents = await eventRepository.findActivePoolEvents({transaction});
                const fApiEvents = _.reject(autoEvents, {fapiId: null});
                await Promise.all(_.map(fApiEvents, async ({id: eventId, fapiId, updatedAt, filter}) => {
                    const matches = await apiFootballSdk.getMatches(fapiId, {stage: _.split(filter, ',')});
                    const teams = await apiFootballSdk.getTeams(fapiId);
                    const {season} = _.sample(matches);
                    if (!_.isNil(season)) {
                        const {endDate} = season;
                        if (moment().isBefore(endDate)) {
                            const currentMatches = _.filter(matches, ({matchday, lastUpdated, utcDate, homeTeam, awayTeam}) => {
                                return moment(utcDate).isBetween(moment(), moment().add(13, "days")) && _.get(homeTeam, 'id') && _.get(awayTeam, 'id');
                            });
                            if(!_.isEmpty(currentMatches)) {
                                await eventRepository.updateEvent({id: eventId, isActive: true}, transaction);
                                const currentTeamIds = _.concat(_.map(currentMatches, 'homeTeam.id'), _.map(currentMatches, 'awayTeam.id'));
                                const dbTeamsMap = await mapTeams(_.filter(teams, ({id}) => _.includes(currentTeamIds, id)), {transaction});
                                const gamesData = prepareGames(eventId, currentMatches, dbTeamsMap);
                                await gameRepository.createAll(gamesData, {transaction});
                                const games = await gameRepository.findGamesByQuery({fapiId: {[Op.in]: _.map(currentMatches, 'id')}}, {transaction})
                                const challengesData = prepareChallenges(games);
                                await challengeRepository.createAll(challengesData, {transaction});
                            }
                        } else {
                            return eventRepository.updateEvent({id: eventId, isActive: false}, {transaction});
                        }
                    }
                    if (fapiId) {
                        try {
                            const standings = await apiFootballSdk.getStandings(fapiId);
                            if (!_.isEmpty(standings)) {
                                const rows = await buildStandingRows(eventId, standings, { transaction });
                                await standingRepository.syncStandings(eventId, rows, { transaction });
                                logger.log('info', `[standings] synced ${rows.length} rows for event ${eventId}`);
                            }
                        } catch (standingsErr) {
                            // Non-fatal: log and continue (e.g. knockout-only competitions have no standings)
                            logger.log('info', `[standings] could not fetch standings for fapiId ${fapiId}: ${standingsErr.message}`);
                        }
                    }
                }));
                await transaction.commit();
            } catch (e) {
                logger.error(e);
                await transaction.rollback();
            }
        });
    }
};
