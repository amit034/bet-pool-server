'use strict';
const _ = require('lodash');
const moment = require('moment');
const { Sequelize, sequelize} = require('../models');
const {Op} = Sequelize;
const Bot = require('./bot');
const gameRepository = require('../repositories/gameRepository');
const challengeRepository = require('../repositories/challengeRepository');
const poolRepository = require('../repositories/poolRepository');
const repository = require('../repositories/betRepository');
const betRepository = require("../repositories/betRepository");

class MonkeyBot extends Bot{
    constructor() {
        super(2, 'monkeyBot');
    }
    setBet({openChallenge = []}) {
        return _.map(openChallenge, (c) => this.defaultBet(c));
    }
    async betForOthers() {
        const transaction = await sequelize.transaction();
        try {
            const pools = await poolRepository.findPoolsByUserId(this.id, {transaction});
            const activePools = _.filter(pools, ({events}) => {
                return _.some(events, 'isActive');
            });
            // Get all challenges for active pools (both future and past due)
            const eventsIds = _.map(_.flatten(_.map(activePools, 'events')), 'id');
            const allChallenges = await challengeRepository.findAllByQuery({
                odds1: {[Op.ne]: 0}, 
                odds2: {[Op.ne]: 0},
                status: 'SCHEDULED'
            }, {
                include: [{model: require('../models').Game, where: {eventId: {[Op.in]: eventsIds}, round: {[Op.gt]: 0}}, as: 'game'}],
                transaction
            });
            const usersBets = await repository.findUserBetsByQuery({poolId: {[Op.in]: _.map(activePools, 'poolId')}}, {transaction});
            const betsByPoolId = _.reduce(usersBets, (acc, bet) => {
                const pool = _.get(acc, bet.poolId, {});
                const bets = _.get(pool, bet.challengeId, []);
                bets.push(bet.userId);
                _.set(pool, bet.challengeId, bets);
                _.set(acc, bet.poolId, pool);
                return acc;
            }, {});
            const monkeyBets = _.filter(usersBets, {userId: 2});
            const challengesByEventId = _.groupBy(allChallenges, (c) => {
                return _.get(c, 'game.eventId');
            });
            const bets = _.reduce(activePools, (aggPools, pool) => {
                const {poolId, events, participates} = pool;
                const missingEventsBets = _.reduce(events, (aggEvents, event) => {
                    const challenges = _.get(challengesByEventId, event.id);
                    const missingChallenges = _.reduce(challenges, (aggChallenges, c) => {
                        // Check if monkey bot has a bet for this challenge
                        const monkeyBet = _.find(monkeyBets, {userId: 2, challengeId: c.id, poolId});
                        
                        // Find participants who haven't bet on this challenge
                        const participate = _.difference(_.map(participates, 'userId'), _.get(betsByPoolId, [poolId, c.id], []));
                        
                        if (participate.length > 0) {
                            // If monkey bot has a bet, use it; otherwise use money bot strategy
                            let score1, score2;
                            if (!_.isNil(monkeyBet)) {
                                score1 = monkeyBet.score1;
                                score2 = monkeyBet.score2;
                            } else {
                                // Use money bot strategy for this challenge
                                score1 = _.get(c, 'odds1', 0) < 2 ? 3 : 1;
                                score2 = _.get(c, 'odds2', 0) < 2 ? 3 : 1;
                            }
                            
                            aggChallenges.push(..._.map(participate, (userId) => {
                                return {
                                    challenge: c.id,
                                    pool: poolId,
                                    participate: userId,
                                    score1: score1,
                                    score2: score2
                                };
                            }));
                        }
                        return aggChallenges;
                    }, []);
                    aggEvents.push(...missingChallenges);
                    return aggEvents;
                }, []);
                aggPools.push(...missingEventsBets);
                return aggPools;
            }, []);
            if (bets) {
                await repository.bulkCreate(bets, {ignoreDuplicates: true, transaction});
            }
            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
        }
    }

}

module.exports = MonkeyBot;