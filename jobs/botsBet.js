'use strict';
const schedule = require('node-schedule');
const logger = require('../utils/logger');
const bots = require('../bots');
const _ = require('lodash');
const moment = require('moment');
const {Sequelize, Pool} = require('../models');
const {Op} = Sequelize;
const challengeRepository = require('../repositories/challengeRepository');
const betRepository = require('../repositories/betRepository');
let activeBots = [];
module.exports = {

    start() {
        schedule.scheduleJob('* */1 * * *', async() => {
            const challenges = await challengeRepository.findByQuery(
                {[Op.and]: [{playAt: {[Op.lt]: moment()}}, {playAt: {[Op.lt]: moment()}}]}, {include: [{model: Pool, as: 'pools'}]});
            const challengesIds = _.map(challenges, 'challengeId');
            const currentBets = await betRepository.findUserBetsByQuery({challengesId: {[Op.in]: challengesIds}, userId: {[Op.in]: [1, 2, 3, 4, 5]}});
            const toBet = _.flatten(_.map(challenges, (challenge) => {
                const {challengeId} = challenge;
                return _.flatten(_.map(bots, (bot) => {
                    const userId = bet.id;
                    const currentChallengesBets = _.filter(currentBets, {challengeId, userId});
                    const poolIds = _.difference(_.map(_.get(challenge, 'pools'), 'poolId'), _.map(currentChallengesBets, 'poolId'));
                    if (!_.isEmpty(poolIds)) {
                        const bet = bot.bet(challenge);
                        return _.map(poolIds, (poolId) => {
                            return _.assign({}, bet, {poolId, challengeId, isPublic: 1});
                        })
                    }
                    return [];
                }));
            }));
            return betRepository.createBulk(toBet);
        });
    }
};