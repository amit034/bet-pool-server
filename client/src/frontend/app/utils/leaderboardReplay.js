'use strict';
import _ from 'lodash';
import {getParticipatesWithRank} from '../utils';

const DEFAULT_FACTORS = {0: 0, 1: 10, 2: 20, 3: 30};

/**
 * Medal tier for a prediction vs final score (matches server Bet.prototype.score).
 */
export function medalFromPrediction(predScore1, predScore2, actual1, actual2) {
    if (_.isNil(predScore1) || _.isNil(predScore2)) {
        return 0;
    }
    const ph = _.parseInt(predScore1, 10);
    const pa = _.parseInt(predScore2, 10);
    const sh = _.parseInt(actual1, 10);
    const sa = _.parseInt(actual2, 10);
    if (ph === sh && pa === sa) {
        return 3;
    }
    if (ph - pa === sh - sa) {
        return 2;
    }
    if ((ph - pa) * (sh - sa) > 0) {
        return 1;
    }
    return 0;
}

export function buildChallengeMetaFromBets(betsMap) {
    const meta = {};
    _.forEach(betsMap, (b) => {
        const ch = b.challenge;
        if (!ch || ch.refName !== 'Game') {
            return;
        }
        const gid = ch.refId;
        if (!gid) {
            return;
        }
        const entry = {
            gameId: gid,
            factor: ch.factorId || 1,
            round: _.get(ch, 'game.round')
        };
        meta[ch.id] = entry;
        meta[String(ch.id)] = entry;
    });
    return meta;
}

/**
 * Leaderboard rows for a simulated score map (live-style: every bet counts with current lines).
 */
export function computeLeaderboardSnapshot(participates, poolFactors, gameScores, challengeMeta, {roundIndex} = {}) {
    const factors = poolFactors || DEFAULT_FACTORS;
    const p0 = _.first(participates);
    const roundsLen = _.size(_.get(p0, 'rounds', []));
    const roundIndices = _.isInteger(roundIndex)
        ? [roundIndex]
        : _.range(roundsLen);

    const rows = _.map(participates, (p) => {
        let score = 0;
        const medals = {1: 0, 2: 0, 3: 0};
        _.forEach(roundIndices, (ri) => {
            const r = _.get(p.rounds, ri);
            if (!r || !r.bets) {
                return;
            }
            _.forEach(r.bets, (bet) => {
                const m = challengeMeta[bet.challengeId] || challengeMeta[String(bet.challengeId)];
                if (!m) {
                    return;
                }
                const pair = gameScores[m.gameId];
                const ah = pair ? pair[0] : 0;
                const aa = pair ? pair[1] : 0;
                const medal = medalFromPrediction(bet.score1, bet.score2, ah, aa);
                if (!medal) {
                    return;
                }
                const fac = bet.factor || m.factor || 1;
                score += _.get(factors, medal, 0) * fac;
                medals[medal] = (medals[medal] || 0) + fac;
            });
        });
        return {
            userId: p.userId,
            username: p.username,
            firstName: p.firstName,
            lastName: p.lastName,
            picture: p.picture,
            isBot: p.isBot,
            score,
            medals
        };
    });
    return getParticipatesWithRank(rows);
}

/**
 * Filter goal log lines by competition round number (game.round).
 */
/**
 * Replay caption: "Home - Away 2-1" (no game id). Uses pool bets' challenge.game teams.
 */
export function formatReplayScoreline(logEntry, betsMap) {
    if (!logEntry) {
        return 'Start · all matches 0-0';
    }
    const gid = Number(logEntry.gameId);
    const bet = _.find(_.values(betsMap || {}), (b) => {
        const refId = _.get(b, 'challenge.refId');
        const gameId = _.get(b, 'challenge.game.id');
        return Number(refId) === gid || Number(gameId) === gid;
    });
    const home = _.get(bet, 'challenge.game.homeTeam') || {};
    const away = _.get(bet, 'challenge.game.awayTeam') || {};
    const homeName = home.shortName || home.name || 'Home';
    const awayName = away.shortName || away.name || 'Away';
    return `${homeName} - ${awayName} ${logEntry.score1}-${logEntry.score2}`;
}

export function filterGoalLogsByRound(logs, roundId) {
    if (roundId == null || roundId === '') {
        return logs;
    }
    const want = Number(roundId);
    return _.filter(logs, (e) => Number(e.roundId) === want);
}

/**
 * Build timeline: initial empty scores + cumulative state after each log entry (pool-filtered order).
 * @param {number} [roundId] - game.round value; filters log lines for per-round replay
 * @param {number} [roundIndex] - participates[].rounds index; scopes leaderboard to that round only
 */
export function buildReplaySnapshots(participates, poolFactors, sortedLogs, challengeMeta, {roundId, roundIndex} = {}) {
    const logs = roundId != null && roundId !== '' ? filterGoalLogsByRound(sortedLogs, roundId) : sortedLogs;
    const rIdx = _.isInteger(roundIndex) ? roundIndex : undefined;
    const snapshots = [];
    const gameScores = {};
    const pushSnapshot = (stepIndex, logEntry) => {
        const leaders = computeLeaderboardSnapshot(participates, poolFactors, gameScores, challengeMeta, {roundIndex: rIdx});
        snapshots.push({
            stepIndex,
            logEntry: logEntry || null,
            gameScores: _.cloneDeep(gameScores),
            leaders
        });
    };
    pushSnapshot(0, null);
    _.forEach(logs, (log, i) => {
        gameScores[log.gameId] = [_.parseInt(log.score1, 10) || 0, _.parseInt(log.score2, 10) || 0];
        pushSnapshot(i + 1, log);
    });
    return snapshots;
}
