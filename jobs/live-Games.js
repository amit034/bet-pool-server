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
let score1 = 0;
let score2 = 0;
module.exports = {

    async start(io) {
       schedule.scheduleJob('* * * * *', async () => {
           const transaction = await sequelize.transaction();
           try {
               const liveEvents = await eventRepository.findLiveGames({transaction});
               await Promise.all(_.map(liveEvents, async ({fapiId, games, pools}) => {
                   const matches = await apiFootballSdk.getMatches(fapiId);
                   await Promise.all(_.map(games, async (game) => {
                       const match = _.find(matches, {id: game.fapiId});
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
                               return io.in(_.map(pools, 'id').join(' ')).emit('updateChallenge', data);
                           }

                       }

                       return Promise.resolve();
                   }));
               }))
               await transaction.commit();
           } catch (e) {
               logger.error(e);
               await transaction.rollback();
           }
       });
    }
};

