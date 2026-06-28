'use strict';
const _ = require('lodash');
const { Sequelize } = require('../models');
const { Op } = Sequelize;
const Bot = require('./bot');
const challengeRepository = require('../repositories/challengeRepository');
const moment = require('moment');

// Euclidean distance between two (odds1, odds2) pairs
function oddsDist(a, b) {
    return Math.sqrt(Math.pow(a.odds1 - b.odds1, 2) + Math.pow(a.odds2 - b.odds2, 2));
}

// Most-voted result from a list of {score1, score2} objects
function mostCommonResult(bets) {
    const counts = _.countBy(bets, b => `${b.score1}-${b.score2}`);
    const top = _.maxBy(_.entries(counts), ([, n]) => n);
    const [s1, s2] = top[0].split('-').map(Number);
    return {score1: s1, score2: s2};
}

// Translate odds into a predicted score using a tiered model:
//   odds < 1.5  → dominant favourite  → 3 goals
//   odds < 2.0  → clear favourite     → 2 goals
//   otherwise   → balanced/underdog   → 1 goal
function oddsToScore(odds) {
    if (odds < 1.5) return 3;
    if (odds < 2.0) return 2;
    return 1;
}

class SmartBot extends Bot {
    constructor() {
        super(1, 'smartBot');
    }

    async learningData(openChallenge, {transaction}) {
        // Fetch all past challenges that have final scores and valid odds
        const pastChallenges = await challengeRepository.findAllByQuery({
            playAt: {[Op.lt]: moment()},
            odds1:  {[Op.ne]: 0},
            odds2:  {[Op.ne]: 0},
            [Op.and]: [
                {score1: {[Op.ne]: null}}, {score1: {[Op.ne]: ''}},
                {score2: {[Op.ne]: null}}, {score2: {[Op.ne]: ''}}
            ]
        }, {raw: true, transaction});
        return {pastChallenges};
    }

    setBet({openChallenge, learningData}) {
        const past = _.get(learningData, 'pastChallenges', []);

        return _.map(openChallenge, (challenge) => {
            // Find past games with a similar odds profile (within 0.2 on both axes combined)
            const similar = _.filter(past, (p) => oddsDist(challenge, p) <= 0.2);

            if (similar.length >= 3) {
                // Enough historical data — use the most common real result
                const {score1, score2} = mostCommonResult(similar);
                return {challengeId: challenge.id, userId: this.id, score1, score2, isPublic: true};
            }

            // Not enough history — derive a prediction directly from the odds
            const score1 = oddsToScore(challenge.odds1);
            const score2 = oddsToScore(challenge.odds2);
            return {challengeId: challenge.id, userId: this.id, score1, score2, isPublic: true};
        });
    }
}

module.exports = SmartBot;
