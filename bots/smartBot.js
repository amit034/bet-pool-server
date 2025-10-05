'use strict';
const _ = require('lodash');
const { Sequelize} = require('../models');
const {Op} = Sequelize;
const Bot = require('./bot');
const challengeRepository = require('../repositories/challengeRepository');
const moment = require('moment');

function calculateMostCommonResult(filteredGames) {
    const results = filteredGames.map(game => `${game.score1}-${game.score2}`);
    const counts = _.countBy(results);
    const maxCount = _.max(_.values(counts));
    const mostCommonResult = _.findKey(counts, count => count === maxCount);
    const [score1, score2] = mostCommonResult.split('-').map(Number);
    return { score1, score2 };
}
class SmartBot extends Bot{
    constructor() {
        super(1, 'smartBot');
    }
    async learningData({transaction}) {
        const oldChallenges = await challengeRepository.findAllByQuery({
            playAt: {[Op.lte]: moment().add(2, 'hours')},
            odds1: {[Op.ne]: 0}, odds2: {[Op.ne]: 0},
            [Op.and]: [
                {score1: {[Op.ne]: null}}, {score1: {[Op.ne]: ''}},
                {score2: {[Op.ne]: null}}, {score2: {[Op.ne]: ''}}
            ]
        },{ raw: true, transaction});
        return {oldChallenges};
    }
    setBet({openChallenge, learningData}) {
        const oldChallenges = _.get(learningData, 'oldChallenges', []);
        return _.map(openChallenge, (challenge) => {
            const oddsRef = challenge.odds1 < challenge.odds2 ? 'odds1' : 'odds2';
            const prevSameOdds = _.filter(oldChallenges, (other) => {
                const currentOdds = _.toNumber(_.get(challenge, oddsRef, ''));
                const otherOdds = _.toNumber(_.get(other, oddsRef, ''));
                return Math.abs( currentOdds- otherOdds) <= 0.1;
            });
            if (_.isEmpty(prevSameOdds)) {
                return this.defaultBet(challenge);
            }
            const {score1, score2} = calculateMostCommonResult(prevSameOdds);
            return {challengeId: challenge.id, userId: this.id,
                score1, score2, isPublic: true};
        });
    }
}
module.exports = SmartBot;