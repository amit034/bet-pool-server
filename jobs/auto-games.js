'use strict';
const schedule = require('node-schedule');
const logger = require('../utils/logger');
const moment = require('moment');
const _ = require('lodash');

const {sequelize, Challenge: {TYPES}} = require('../models');
const {Op} = require("sequelize");
const apiFootballSdk = require('../lib/apiFootballSDK');
const eventRepository = require('../repositories/eventRepository');
const teamRepository = require('../repositories/teamRepository');
const gameRepository = require('../repositories/gameRepository');
const challengeRepository = require('../repositories/challengeRepository');

async function findOrCreateTeam(data, {transaction}) {
    const {id: fapiId, name, shortName, tla: code, crestUrl: flag} = data;
    return teamRepository.findOrCreate({fapiId, name, shortName, code, flag}, {transaction});
}

function createOrGetGame(teams, eventId, {transaction}) {
    return async (match) => {
        const {id: matchId, homeTeam, awayTeam, status, utcDate: playAt, matchDay: round} = match;
        const {id: homeTeamId} = await findOrCreateTeam(_.find(teams, {id: _.get(homeTeam, 'id')}), {transaction});
        const {id: awayTeamId} = await findOrCreateTeam(_.find(teams, {id: _.get(awayTeam, 'id')}), {transaction});
        const {id: refId, factorId} = await gameRepository.findOrCreate({
            eventId,
            round,
            fapiId: matchId,
            playAt,
            homeTeamId,
            awayTeamId,
            status
        }, {transaction});
        return challengeRepository.findOrCreate({
            type: TYPES.FULL_TIME,
            refName: 'Game',
            refId,
            playAt,
            status,
            factorId
        }, {transaction});
    };
}

module.exports = {
    async start() {
 //       schedule.scheduleJob('* * * * *', async () => {
            const transaction = await sequelize.transaction();
            try {
                const autoEvents = await eventRepository.findActivePoolEvents({transaction});
                const fApiEvents = _.reject(autoEvents, {fapiId: null});
                await Promise.all(_.map(fApiEvents, async ({id: eventId, fapiId}) => {
                    const matches = await apiFootballSdk.getMatches(fapiId, {stage: 'GROUP_STAGE'});
                    const teams = await apiFootballSdk.getTeams(fapiId);
                    const {season} = _.sample(matches);
                    if (!_.isNil(season)) {
                        const {endDate, currentMatchday: matchday} = season;
                        if (moment().isBefore(endDate)) {
                            const currentMatches = _.filter(matches, {matchday});
                            await Promise.all(_.map(currentMatches, createOrGetGame(teams, eventId, {transaction})))
                        } else {
                            return eventRepository.updateEvent({id: eventId, isActive: false}, {transaction})
                        }
                    }
                }))
                await transaction.commit();
            } catch (e) {
                logger.error(e);
                await transaction.rollback();
            }
 //       });
    }
};

