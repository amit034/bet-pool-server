'use strict';
const _ = require('lodash');
const {Bet} = require('../models');

const SCORING_MODE = {
    CLASSIC: 0,
    ODDS: 1
};

const DEFAULT_POOL_FACTORS = {0: 0, 1: 10, 2: 20, 3: 30};

function medalFromBet(bet, actualScore1, actualScore2) {
    const betModel = bet instanceof Bet ? bet : new Bet(bet);
    return betModel.score(_.parseInt(actualScore1, 10), _.parseInt(actualScore2, 10));
}

function actualResultOdds(actualScore1, actualScore2, challenge) {
    const sh = _.parseInt(actualScore1, 10);
    const sa = _.parseInt(actualScore2, 10);
    if (_.isNaN(sh) || _.isNaN(sa)) {
        return 1;
    }

    let odds;
    if (sh > sa) {
        odds = challenge.odds1;
    } else if (sh === sa) {
        odds = challenge.oddsX;
    } else {
        odds = challenge.odds2;
    }

    const n = Number(odds);
    return n > 0 ? n : 1;
}

function isOddsScoringMode(scoringMode) {
    return _.parseInt(scoringMode, 10) === SCORING_MODE.ODDS;
}

function computeBetScore({
    bet,
    challenge,
    poolFactors,
    actualScore1,
    actualScore2,
    scoringMode
}) {
    const factors = poolFactors || DEFAULT_POOL_FACTORS;
    const medal = medalFromBet(bet, actualScore1, actualScore2);
    const factorId = _.parseInt(_.get(challenge, 'factorId', 1), 10) || 1;
    const base = _.get(factors, medal, 0) * factorId;

    if (!medal) {
        return {medal: 0, score: 0, basePoints: 0, oddsMultiplier: 1};
    }

    const oddsMult = isOddsScoringMode(scoringMode)
        ? actualResultOdds(actualScore1, actualScore2, challenge)
        : 1;

    return {
        medal,
        basePoints: base,
        oddsMultiplier: oddsMult,
        score: Math.round(base * oddsMult)
    };
}

function applyBetScoreFields(bet, computed) {
    bet.medal = computed.medal;
    bet.score = computed.score;
    bet.basePoints = computed.basePoints;
    bet.oddsMultiplier = computed.oddsMultiplier;
    return bet;
}

module.exports = {
    SCORING_MODE,
    DEFAULT_POOL_FACTORS,
    medalFromBet,
    actualResultOdds,
    isOddsScoringMode,
    computeBetScore,
    applyBetScoreFields
};
