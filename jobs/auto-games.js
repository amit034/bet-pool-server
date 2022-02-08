'use strict';
const schedule = require('node-schedule');
const logger = require('../utils/logger');
const moment = require('moment');
const _ = require('lodash');

const {sequelize, Challenge: {TYPES}} = require('../models');
const apiFootballSdk = require('../lib/apiFootballSDK');
const eventRepository = require('../repositories/eventRepository');
const teamRepository = require('../repositories/teamRepository');
const gameRepository = require('../repositories/gameRepository');
const challengeRepository = require('../repositories/challengeRepository');


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
                await Promise.all(_.map(fApiEvents, async ({id: eventId, fapiId}) => {
                    const matches = await apiFootballSdk.getMatches(fapiId, {stage: 'LAST_16'});
                    const teams = await apiFootballSdk.getTeams(fapiId);
                    const {season} = _.sample(matches);
                    if (!_.isNil(season)) {
                        const {endDate, currentMatchday: matchday} = season;
                        if (moment().isBefore(endDate)) {
                            const currentMatches = _.filter(matches, {matchday});
                            const currentTeamIds = _.concat(_.map(currentMatches, 'homeTeam.id'), _.map(currentMatches, 'awayTeam.id'));
                            const dbTeamsMap = await mapTeams(_.filter(teams, ({id}) => _.includes(currentTeamIds, id)), {transaction});
                            const gamesData = await prepareGames(eventId, currentMatches, dbTeamsMap);
                            const games = await gameRepository.createAll(gamesData, {transaction});
                            const challengesData = prepareChallenges(games);
                            await challengeRepository.createAll(challengesData, {transaction});

                        } else {
                            return eventRepository.updateEvent({id: eventId, isActive: false}, {transaction});
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
