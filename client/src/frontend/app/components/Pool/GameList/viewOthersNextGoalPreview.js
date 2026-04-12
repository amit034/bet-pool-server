import _ from 'lodash';
import { getOutcome } from '../../../utils';
import { rankDeltaFromBaseline } from './viewOthersRankDelta';

const DEFAULT_FACTORS = { 0: 0, 1: 10, 2: 20, 3: 30 };

function normalizeParticipates(participates) {
    if (!participates) return [];
    return Array.isArray(participates) ? participates : _.values(participates);
}

function profileLookup(participates) {
    const list = normalizeParticipates(participates);
    const byKey = {};
    _.each(list, (p) => {
        const uid = p.userId;
        if (uid == null) return;
        byKey[uid] = p;
        byKey[String(uid)] = p;
        const n = Number(uid);
        if (!Number.isNaN(n)) byKey[n] = p;
    });
    return (userId) => byKey[userId] ?? byKey[String(userId)] ?? byKey[Number(userId)] ?? {};
}

function baselineByUserId(baselineFinalState) {
    const list = baselineFinalState || [];
    const byKey = {};
    _.each(list, (row) => {
        const uid = row.userId;
        if (uid == null) return;
        byKey[uid] = row;
        byKey[String(uid)] = row;
        const n = Number(uid);
        if (!Number.isNaN(n)) byKey[n] = row;
    });
    return (userId) => byKey[userId] ?? byKey[String(userId)] ?? byKey[Number(userId)];
}

export function findBetOnChallenge(participate, challengeId, roundId) {
    const round = _.find(participate.rounds, (r) => r.round === roundId);
    if (!round || !round.bets) return {};
    return (
        _.find(round.bets, (b) => String(b.challengeId) === String(challengeId) || b.challengeId === challengeId) || {}
    );
}

export function medalFromOutcome(o) {
    if (!o) return 0;
    if (o.g) return 3;
    if (o.s) return 2;
    if (o.b) return 1;
    return 0;
}

/**
 * Same data shape as View Others: header challenge (scores replaced), usersBets, participatesWithRank.
 */
export function buildNextGoalViewOthersRows(participates, { challenge, impact, baselineFinalState, challengeId, roundId, poolFactors }) {
    const factors = poolFactors || DEFAULT_FACTORS;
    const [proposedH, proposedA] = String(impact.gameScoreLabel || '0-0')
        .split('-')
        .map((x) => Number(x));
    const currentH = Number(challenge.score1) || 0;
    const currentA = Number(challenge.score2) || 0;
    const splitScores = { currentH, currentA, proposedH, proposedA };
    const factorId = challenge.factorId || 1;
    const getProfile = profileLookup(participates);
    const getBaseline = baselineByUserId(baselineFinalState);
    const participatesList = normalizeParticipates(participates);

    const usersBets = _.map(participatesList, (p) => {
        const b = findBetOnChallenge(p, challengeId, roundId);
        const pred =
            b.score1 != null && b.score2 != null && b.score1 !== '' && b.score2 !== ''
                ? [Number(b.score1), Number(b.score2)]
                : null;
        const o = getOutcome(pred, [proposedH, proposedA]);
        const medal = medalFromOutcome(o);
        return {
            userId: p.userId,
            score1: b.score1,
            score2: b.score2,
            challengeId,
            score: _.get(factors, medal, 0) * factorId,
            medal,
        };
    });

    const participatesWithRank = _.map(impact.finalState || [], (fs) => {
        const profile = getProfile(fs.userId);
        const base = getBaseline(fs.userId);
        let ptsDelta = null;
        if (base && _.isFinite(base.score) && _.isFinite(fs.score)) {
            ptsDelta = fs.score - base.score;
        }
        const rankDelta = rankDeltaFromBaseline(base, fs);
        return {
            ...profile,
            userId: fs.userId,
            rank: fs.rank,
            score: fs.score,
            ptsDelta,
            rankDelta,
        };
    });

    return { splitScores, usersBets, participatesWithRank };
}
