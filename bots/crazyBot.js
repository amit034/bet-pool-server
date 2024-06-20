'use strict';
const _ = require('lodash');
const { Sequelize} = require('../models');
const {Op} = Sequelize;
const Bot = require('./bot');
const challengeRepository = require('../repositories/challengeRepository');
const moment = require('moment');

function calculateMeanPoint(pairs) {
    const sum = pairs.reduce((acc, pair) => {
        acc[0] += pair[0];
        acc[1] += pair[1];
        return acc;
    }, [0, 0]);
    return [sum[0] / pairs.length, sum[1] / pairs.length];
}
function calculateDistances(pairs, meanPoint) {
    return pairs.map(pair => Math.sqrt(Math.pow(pair[0] - meanPoint[0], 2) + Math.pow(pair[1] - meanPoint[1], 2)));
}
function removeOutlierPairs(pairs, threshold = 2) {
    const meanPoint = calculateMeanPoint(pairs);
    const distances = calculateDistances(pairs, meanPoint);
    const meanDistance = distances.reduce((acc, d) => acc + d, 0) / distances.length;
    const stdDevDistance = Math.sqrt(distances.reduce((acc, d) => acc + Math.pow(d - meanDistance, 2), 0) / distances.length);

    return pairs.filter((pair, index) => Math.abs(distances[index] - meanDistance) < threshold * stdDevDistance);
}

function calculateMedian(scores) {
    scores.sort((a, b) => a - b);
    const mid = Math.floor(scores.length / 2);
    return scores.length % 2 !== 0 ? scores[mid] : (scores[mid - 1] + scores[mid]) / 2;
}

function predictNextScore(prevGames) {
    // Remove outlier pairs
    const cleanedPairs = removeOutlierPairs(prevGames);
    const cleanedAScores = cleanedPairs.map(pair => pair[0]);
    const cleanedBScores = cleanedPairs.map(pair => pair[1]);
    // Calculate median
    const medianAScore = calculateMedian(cleanedAScores);
    const medianBScore = calculateMedian(cleanedBScores);
    // Round to nearest whole number for football scores
    const predictedAScore = Math.round(medianAScore);
    const predictedBScore = Math.round(medianBScore);
    return [predictedAScore, predictedBScore];
}
function calculateMostCommonResult(pairs) {
    const results = pairs.map(pair => `${pair[0]}-${pair[1]}`);
    const counts = _.countBy(results);
    const maxCount = _.max(_.values(counts));
    const mostCommonResult = _.findKey(counts, count => count === maxCount);
    return mostCommonResult.split('-').map(Number);
}

class CrazyBot extends Bot{
    constructor() {
        super(3, 'AIBot');
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
    setBet({openChallenge = [], learningData}) {
        const oldChallenges = _.get(learningData, 'oldChallenges', []);
        return _.map(openChallenge, (challenge) => {
            const flip = challenge.odds1 > challenge.odds2;
            const oddsRef = flip ? 'odds2' : 'odds1';
            const ref1 = flip ? 'score2' : 'score1';
            const ref2 = flip ? 'score1' : 'score2';
            const currentOdds = _.toNumber(_.get(challenge, oddsRef, ''));
            const prevSameOdds = _.filter(oldChallenges, (other) => {
                const otherOdds = _.toNumber(_.get(other, oddsRef, ''));
                return Math.abs( currentOdds- otherOdds) <= 0.1;
            });
            const pairs = _.map(prevSameOdds, (other) => {
                return [_.toNumber(other[ref1]), _.toNumber(other[ref2])];
            });
            const pair = calculateMostCommonResult(pairs);
            const pair2 = predictNextScore(pairs);
            const bet =  {challengeId: challenge.id, userId: this.id, isPublic: true};
            _.set(bet, ref1, pair2[0]);
            _.set(bet, ref2, pair2[1]);
        });
        // return _.map(openChallenge, (challenge) => {
        //     const odds1 = _.get(challenge, 'odds1', 1);
        //     const odds2 = _.get(challenge, 'odds2', 1);
        //     const score1 = _.inRange(odds1, 2, 2.5) ? 0 : odds1 < 2 ? 1 : 2;
        //     const score2 = _.inRange(odds2, 2, 2.5) ? 0 : odds2 < 2 ? 1 : 2;
        //     return {
        //         challengeId: challenge.id, userId: this.id,
        //         score1, score2, isPublic: true
        //     };
        // });
    }
}

module.exports = CrazyBot;