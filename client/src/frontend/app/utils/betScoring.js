'use strict';
import _ from 'lodash';
import {medalFromPrediction} from './leaderboardReplay';

export const SCORING_MODE = {
    CLASSIC: 0,
    ODDS: 1,
    WINNER2: 2
};

export const DEFAULT_POOL_FACTORS = {0: 0, 1: 10, 2: 20, 3: 30};

export function actualResultOdds(actualScore1, actualScore2, challenge) {
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

export function isOddsScoringMode(scoringMode) {
    return _.parseInt(scoringMode, 10) === SCORING_MODE.ODDS;
}

export function isWinner2ScoringMode(scoringMode) {
    return _.parseInt(scoringMode, 10) === SCORING_MODE.WINNER2;
}

export function usesResultOdds(scoringMode) {
    const mode = _.parseInt(scoringMode, 10);
    return mode === SCORING_MODE.ODDS || mode === SCORING_MODE.WINNER2;
}

/**
 * Winner2: map decimal odds to tier points (קל / בינוני / קשה / אנדרדוג).
 * 1–1.5 → 0 | 1.5–2.5 → 5 | 2.5–4 → 10 | 4+ → 15
 */
export function winner2OddsBase(rawOdds) {
    const odds = Number(rawOdds);
    if (!odds || odds < 1.6) {
        return 0;
    }
    if (odds < 2.6) {
        return 5;
    }
    if (odds < 4) {
        return 10;
    }
    return 15;
}

export function normalizeFactorsStrategy(raw) {
    const fs = _.parseInt(raw, 10);
    if (fs === SCORING_MODE.ODDS || fs === SCORING_MODE.WINNER2) {
        return fs;
    }
    return SCORING_MODE.CLASSIC;
}

export function computeBetScore({
    bet,
    challenge,
    poolFactors,
    actualScore1,
    actualScore2,
    scoringMode
}) {
    const factors = poolFactors || DEFAULT_POOL_FACTORS;
    const medal = medalFromPrediction(bet.score1, bet.score2, actualScore1, actualScore2);
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

/**
 * Resolve pool scoring config from Redux (pools list and/or preview payload).
 */
export function getPoolScoringFromState(poolsState, poolId) {
    const key = poolId != null ? String(poolId) : '';
    const pool = _.get(poolsState, ['pools', poolId])
        || _.get(poolsState, ['pools', key]);
    const preview = _.get(poolsState, ['poolPreviewById', key]);
    return {
        poolFactors: _.get(pool, 'factors', DEFAULT_POOL_FACTORS),
        scoringMode: _.get(
            pool,
            'factorsStrategy',
            _.get(preview, 'factorsStrategy', SCORING_MODE.CLASSIC)
        )
    };
}

export function challengeForScoring(challenge, actualScore) {
    const ch = challenge || {};
    const score = actualScore || [];
    return _.assign({}, ch, {
        score1: score[0],
        score2: score[1],
        factorId: ch.factorId || 1,
        odds1: ch.odds1,
        oddsX: ch.oddsX,
        odds2: ch.odds2
    });
}

export function scoreFromPrediction(pred, actualScore, challenge, poolFactors, scoringMode) {
    if (!pred || pred.length < 2) {
        return {medal: 0, score: 0, basePoints: 0, oddsMultiplier: 1};
    }
    return computeBetScore({
        bet: {score1: pred[0], score2: pred[1]},
        challenge,
        poolFactors,
        actualScore1: actualScore[0],
        actualScore2: actualScore[1],
        scoringMode
    });
}
