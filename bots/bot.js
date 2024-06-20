'use strict';
const _ = require('lodash');
const config = require('../Config-debug');
const math = require('mathjs');
const moment = require('moment');
const { Sequelize, sequelize, Game} = require('../models');
const {Op} = Sequelize;
const eventRepository = require('../repositories/eventRepository');
const poolRepository = require('../repositories/poolRepository');
const challengeRepository = require('../repositories/challengeRepository');
const betRepository = require('../repositories/betRepository');
const logger = require('../utils/logger');
const gameRepository = require("../repositories/gameRepository");
const repository = require("../repositories/betRepository");

function meanVector(values) {
    const score1Mean = _.meanBy(values, 'score1');
    const score2Mean = _.meanBy(values, 'score2');
    return [score1Mean, score2Mean];
}
function quantile(arr, q) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;

    if ((sorted[base + 1] !== undefined)) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
}
function covarianceMatrix(values, meanVec) {
    const n = values.length;
    const covMatrix = [[0, 0], [0, 0]];

    _.forEach(values, value => {
        const diff1 = value.score1 - meanVec[0];
        const diff2 = value.score2 - meanVec[1];
        covMatrix[0][0] += diff1 * diff1;
        covMatrix[0][1] += diff1 * diff2;
        covMatrix[1][0] += diff2 * diff1;
        covMatrix[1][1] += diff2 * diff2;
    });
    return math.divide(covMatrix, n - 1);
}
function mahalanobisDistance(value, meanVec, covMatrixInv) {
    const diff = [value.score1 - meanVec[0], value.score2 - meanVec[1]];
    return Math.sqrt(math.multiply(math.multiply(diff, covMatrixInv), diff));
}

class Bot {
    constructor(id, name, modifyBets = false) {
        this.id = id;
        this.name = name;
        this.modifyBets = modifyBets;
    }
    async bet(forOthers = false) {
        const transaction = await sequelize.transaction();
        try {
            const pools = await poolRepository.findPoolsByUserId(this.id, {transaction});
            const activePools = _.filter(pools, ({events}) => _.some(events, 'isActive'));
            const eventsIds = _.map(_.flatten(_.map(activePools, 'events')), 'id');
            const myBets = await betRepository.findUserBetsByQuery({userId: this.id}, {transaction});
            const openChallengeQuery = !forOthers ? {odds1: {[Op.ne]: 0}, odds2: {[Op.ne]: 0},
                status: 'SCHEDULED', playAt: {[Op.lte]: moment().add(36, "hours"), [Op.gt]: moment()}} :
                {playAt: {[Op.lte]: moment()}, odds1: {[Op.ne]: 0}, odds2: {[Op.ne]: 0}};
            const openChallenge = await challengeRepository.findAllByQuery(
                openChallengeQuery, {
                include: [{model: Game, where: {eventId: {[Op.in]: eventsIds}}, as: 'game'}],
                raw: true,
                transaction});
            const otherBets = await betRepository.findUserBetsByQuery({challengeId: {[Op.in]: _.map(openChallenge, 'id') }}, {transaction});
            const learningData = await this.learningData(openChallenge, {transaction});
            const bets = await this.setBet({openChallenge, learningData});
            const betsByChallengeId = _.keyBy(bets, 'challengeId');
            const poolsChallenges = _.map(activePools, ({poolId, events}) => {
                const challenges  = _.flatten(_.map(events, (event) => {
                    return _.filter(openChallenge, ({game}) => game.eventId === event.id);
                }));
                return {poolId, challenges};
            })
            const spreadBets = _.reduce(poolsChallenges, (agg, {poolId, challenges}) => {
                const participants = forOthers ?  _.reject(_.get(_.find(activePools, {poolId}), 'participants'), 'isBot'):
                [this.id];
                const betsMade =_.reduce(challenges, (aggChallenge, {id: challengeId}) => {
                    const bet = betsByChallengeId[challengeId];
                    if (bet) {
                        const {score1, score2} = bet;
                        const participantsBets = _.map(participants, ({userId}) => {
                            return {poolId, challengeId, userId, score1, score2};
                        });
                        aggChallenge.push(...participantsBets);
                    }
                    return aggChallenge;
                }, [])
                if (!_.isEmpty(betsMade)) {
                    agg.push(...betsMade);
                }
                return agg;
            }, []);
            const betKeys = ['poolId', 'challengeId', 'userId'];
            const toBet = _.differenceWith(spreadBets, myBets, (one, other) => {
                return _.isEqual(_.pick(one, betKeys), _.pick(other, betKeys))
            });
            const toUpdate = this.modifyBets && _.reduce(myBets, (agg, bet) => {
                 const newBet = betsByChallengeId[bet.challengeId];
                 if (newBet) {
                     const score1 = _.get(newBet, 'score1');
                     const score2 = _.get(newBet, 'score2');
                     if (!_.isNil(score1) && !_.isNil(score2) && (score1 !== bet.score1 || score2 !== bet.score2)) {
                         _.set(bet, 'score1', newBet.score1);
                         _.set(bet, 'score2', newBet.score2);
                         agg.push(bet);
                     }
                 }
                return agg;
            }, []);
            if (!_.isEmpty(toBet)) {
                await betRepository.createBulk(toBet, {transaction});
            }
            if (!_.isEmpty(toUpdate)) {
                await betRepository.bulkUpdate(toUpdate, {transaction});
            }
            await transaction.commit();
            logger.info(`${this.name}: ${_.size(toBet)} bets created`);
            toUpdate && logger.info(`${this.name}: ${_.size(toUpdate)} bets updated`);
        } catch (error) {
            logger.error(error.message);
            await transaction.rollback();
        }
    }
    learningData() {
       return null;
    }

    setBet() {
        throw new Error('bot bet must be overridden by subclass');
    }
    async betForOthers() {
        const transaction = await sequelize.transaction();
        try {
            const pools = await poolRepository.findPoolsByUserId(this.id, {transaction});
            const activePools = _.filter(pools, ({events}) => {
                return _.some(events, 'isActive');
            });
            const closedGames = await gameRepository.findGamesByQuery({playAt: {[Op.lt]: moment()}}, {transaction});
            const gamesById = _.keyBy(closedGames, 'id');
            const challenges = await challengeRepository.findAllByQuery(
                {refName: 'Game', refId: {[Op.in]: _.map(closedGames, 'id')}}, {transaction});
            const usersBets = await repository.findUserBetsByQuery({poolId: {[Op.in]: _.map(activePools, 'poolId')}}, {transaction});
        } catch (error) {
            logger.error(error.message);
            await transaction.rollback();
        }
    }
    removeAnomalies(values) {
        const meanVec = meanVector(values);
        const covMatrix = covarianceMatrix(values, meanVec);
        const covMatrixInv = math.inv(covMatrix);

        // Calculate Mahalanobis distance for each score pair
        const distances = values.map(value => ({
            value,
            distance: mahalanobisDistance(value, meanVec, covMatrixInv),
        }));

        // Determine a threshold for anomaly detection (e.g., 95th percentile)
        const threshold = quantile(
            distances.map(d => d.distance),
            0.95
        );

        // Filter out anomalies
        return distances
            .filter(d => d.distance <= threshold)
            .map(d => d.value);
    }

}

// Bot.prototype.init = function() {
//     const botDetails = _.get(config, `bots.${this.name}`);
//     if (!botDetails || !botDetails.email) {
//         logger.log('warning', `cant start ${this.name} missing bot info (email)`);
//         return Promise.resolve(null);
//     }
//     return accountRepository.findAccountByQuery({email: botDetails.email})
//     .then((user) => {
//         if (user) {
//             return user;
//         }
//         return accountRepository.createAccount(botDetails);
//     }).then((account) => {
//         this.userId =  account._id;
//         return Promise.resolve(this);
//     }).catch((err) => {
//         logger.log('warning', `unable to start ${this.name}`);
//         return Promise.resolve(null);
//     });
// };
module.exports = Bot;
