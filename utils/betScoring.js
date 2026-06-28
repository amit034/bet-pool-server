'use strict';
const _ = require('lodash');
const {Bet} = require('../models');

const SCORING_MODE = {
    CLASSIC: 0,
    ODDS: 1,
    WINNER2: 2
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

function isWinner2ScoringMode(scoringMode) {
    return _.parseInt(scoringMode, 10) === SCORING_MODE.WINNER2;
}

function usesResultOdds(scoringMode) {
    const mode = _.parseInt(scoringMode, 10);
    return mode === SCORING_MODE.ODDS || mode === SCORING_MODE.WINNER2;
}

/**
 * Winner2: map decimal odds to tier points (קל / בינוני / קשה / אנדרדוג).
 * 1–1.5 → 0 | 1.5–2.5 → 5 | 2.5–4 → 10 | 4+ → 15
 */
function winner2OddsBase(rawOdds) {
    const odds = Number(rawOdds);
    if (!odds || odds < 1.6) {
        return 0;
    }
    if (odds < 2.6) {
        return 5;
    }
    if (odds < 4.1) {
        return 10;
    }
    return 15;
}

function normalizeFactorsStrategy(raw) {
    const fs = _.parseInt(raw, 10);
    if (fs === SCORING_MODE.ODDS || fs === SCORING_MODE.WINNER2) {
        return fs;
    }
    return SCORING_MODE.CLASSIC;
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

    const mode = _.parseInt(scoringMode, 10);
    const oddsMultiplier = usesResultOdds(mode)
        ? actualResultOdds(actualScore1, actualScore2, challenge)
        : 1;

    if (mode === SCORING_MODE.WINNER2) {
        const medalFactor = _.get(factors, medal, 0);
        const oddsBase = winner2OddsBase(oddsMultiplier);
        const score = Math.round(medalFactor * factorId + oddsBase);
        return {
            medal,
            basePoints: medalFactor * factorId,
            oddsMultiplier,
            oddsBase,
            score
        };
    }

    return {
        medal,
        basePoints: base,
        oddsMultiplier,
        score: Math.round(base * oddsMultiplier)
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
    winner2OddsBase,
    isOddsScoringMode,
    isWinner2ScoringMode,
    usesResultOdds,
    normalizeFactorsStrategy,
    computeBetScore,
    applyBetScoreFields
};
