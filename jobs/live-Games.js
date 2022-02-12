'use strict';

const schedule = require('node-schedule');
const logger = require('../utils/logger');
const moment = require('moment');
const _ = require('lodash');
const {sequelize, Challenge: {TYPES}} = require('../models');
const apiFootballSdk = require('../lib/apiFootballSDK');
const eventRepository = require('../repositories/eventRepository');
const challengeRepository = require('../repositories/challengeRepository');
module.exports = {

    async start(io) {
       schedule.scheduleJob('* * * * *', async () => {
           const transaction = await sequelize.transaction();
           try {
               const liveEvents = await eventRepository.findLiveGames({transaction});
               await Promise.all(_.map(liveEvents, async ({id: eventId, fapiId, games, pools, updatedAt}) => {
                   const matches = await apiFootballSdk.getMatches(fapiId);
                   const updatedMatches = _.filter(matches, ({lastUpdated}) => {
                       return moment(updatedAt).isBefore(moment(lastUpdated))
                   });
                   if (!_.isEmpty(updatedMatches)) {
                       await eventRepository.updateEvent({id: eventId, isActive: true}, transaction);
                       await Promise.all(_.map(updatedMatches, async (match) => {
                           const game = _.find(games, {fapiId: match.id});
                           if (match) {
                               const {status, utcDate: playAt, score: {fullTime: {homeTeam: homeTeamScore, awayTeam: awayTeamScore}}} = match;
                               const changed = homeTeamScore !== game.homeTeamScore || awayTeamScore !== game.awayTeamScore || status !== game.status;
                               await game.update({playAt, homeTeamScore, awayTeamScore, status}, {transaction});
                               const challenge = await challengeRepository.updateChallengeByQuery({
                                       refName: 'Game',
                                       refId: game.id,
                                       type: TYPES.FULL_TIME
                                   },
                                   {score1: homeTeamScore, score2: awayTeamScore, status}, {transaction});
                               if (changed){
                                   const data = challenge.toJSON();
                                   return io.in(_.map(pools, 'poolId').join(' ')).emit('updateChallenge', data);
                               }
                           }
                           return Promise.resolve();
                       }));
                   }
                   const score1 = Math.floor(Math.random() * (5 - 1) + 1);
                   return ["11","12","13"].forEach((room) => {
                       io.to(room).emit('updateChallenge', {id: 371, score1, score2: 2, status: 'IN_PLAY', game: {
                               "id": 2,
                               "eventId": 1,
                               "round": 1,
                               "playAt": "2022-02-09T00:30:00Z",
                               "homeTeamId": 3,
                               "homeTeamScore": 2,
                               "awayTeamId": 4,
                               "awayTeamScore": 0,
                               "status": "FINISHED",
                               "factorId": 1,
                               "fapiId": null
                           }});
                   });

               }))
               await transaction.commit();
           } catch (e) {
               logger.error(e);
               await transaction.rollback();
           }
       });
    }
};

