'use strict';
const _ = require('lodash');
const { Sequelize} = require('../models');
const {Op} = Sequelize;
const Bot = require('./bot');

const betRepository = require("../repositories/betRepository");

class CrowdBot extends Bot{
    constructor() {
        super(4, 'crowdBot', true);
    }

    async learningData(openChallenge, {transaction}) {
        const challengeIds = _.map(openChallenge, 'id');
        const otherBets = await betRepository.findUserBetsByQuery({
            challengeId: {[Op.in]: challengeIds},
            userId: {[Op.notIn]: [this.id]}
        }, {transaction});
        return {otherBets};
    }

    // Remove outliers per-challenge (needs ≥ 3 bets for Mahalanobis; falls back to raw bets)
    cleanedBets(bets) {
        if (bets.length < 3) return bets;
        try {
            return this.removeAnomalies(bets);
        } catch (e) {
            return bets;
        }
    }

    setBet({openChallenge = [], learningData}) {
        const allOtherBets = _.get(learningData, 'otherBets', []);
        const betsByChallenge = _.groupBy(allOtherBets, 'challengeId');

        return _.map(openChallenge, (challenge) => {
            const raw = betsByChallenge[challenge.id] || [];
            const bets = this.cleanedBets(raw);

            if (_.isEmpty(bets)) {
                return this.defaultBet(challenge);
            }

            const score1 = _.round(_.meanBy(bets, 'score1'));
            const score2 = _.round(_.meanBy(bets, 'score2'));
            return {challengeId: challenge.id, userId: this.id, score1, score2, isPublic: true};
        });
    }
}

// CrowdBot.prototype.bet = function (challengeModel) {
//     if (!this.userId) return;
//     return repository.findByChallengeId(challengeModel._id)
//         .then((bets = []) => {
//             const myBet = _.find(bets,{participate: this.userId});
//             if (myBet) return myBet;
//             const score1Avg = _.sumBy(bets, 'score1') / _.size(bets) ;
//             const score2Avg = _.sumBy(bets, 'score2') / _.size(bets);
//             const score1 = _.isNaN(score1Avg) ? 0 : _.round(score1Avg);
//             const score2 = _.isNaN(score1Avg)? 0 : _.round(score2Avg);
//             return {challenge: challengeModel._id, pool: mongoose.Types.ObjectId('55cdcdc780d1afee6c4d5fdb'), participate: this.userId, score1, score2, public: true};
//         }).then((bet) => {
//             if (_.isPlainObject(bet)){
//                 return repository.createOrUpdate(bet);
//             }
//             return bet;
//         })
// };
//
// util.inherits(CrowdBot, Bot);

module.exports = CrowdBot;

