import _ from 'lodash';
import { getOutcome } from '../../../utils';
import { rankDeltaFromBaseline } from './viewOthersRankDelta';
import { findBetOnChallenge, medalFromOutcome } from './viewOthersNextGoalPreview';

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

/**
 * View-Others-style data for best/worst weekday path from calculatelImpact().
 */
export function buildWeekdayPathViewRows(
    participates,
    { assignment, variant, dateBets, dateLabel, roundId, viewerUserId, poolFactors }
) {
    const pathObj = variant === 'worst' ? assignment.worst : assignment.best;
    const currentPath = assignment.current;
    if (!pathObj?.finalState?.length || !_.isArray(pathObj.path) || pathObj.path.length === 0) {
        return null;
    }

    const closedBets = _.filter(dateBets, 'closed');
    const path = pathObj.path;
    const n = Math.min(closedBets.length, path.length);
    if (n === 0) return null;

    const segments = _.times(n, (i) => {
        const bet = closedBets[i];
        const pathItem = path[i];
        const gs = pathItem.gameScore;
        let proposedH;
        let proposedA;
        if (_.isArray(gs) && gs.length >= 2) {
            proposedH = gs[0];
            proposedA = gs[1];
        } else {
            const parts = String(pathItem.gameScoreLabel || '0-0').split('-');
            proposedH = Number(parts[0]) || 0;
            proposedA = Number(parts[1]) || 0;
        }
        const ch = bet.challenge || {};
        const fromChH = Number(ch.score1);
        const fromChA = Number(ch.score2);
        const currentH = Number.isFinite(fromChH)
            ? fromChH
            : Number(_.get(ch, 'game.homeTeamScore', 0)) || 0;
        const currentA = Number.isFinite(fromChA)
            ? fromChA
            : Number(_.get(ch, 'game.awayTeamScore', 0)) || 0;
        return {
            bet,
            proposedH,
            proposedA,
            currentH,
            currentA,
        };
    });

    const getProfile = profileLookup(participates);
    const baselineFinalState = currentPath?.finalState;
    const getBaseline = baselineByUserId(baselineFinalState);

    const participatesWithRank = _.map(pathObj.finalState, (fs) => {
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

    const firstBet = segments[0]?.bet;
    const firstChallengeId = firstBet?.challengeId;
    const firstPathItem = path[0];
    const scenarioFirstScore = _.isArray(firstPathItem?.gameScore) ? firstPathItem.gameScore : null;
    const factorId = _.get(firstBet, 'challenge.factorId', 1) || 1;
    const factors = poolFactors || DEFAULT_FACTORS;
    const list = normalizeParticipates(participates);

    const usersBets = _.map(list, (p) => {
        const b =
            firstChallengeId != null && roundId != null
                ? findBetOnChallenge(p, firstChallengeId, roundId)
                : {};
        const pred =
            b.score1 != null && b.score2 != null && b.score1 !== '' && b.score2 !== ''
                ? [Number(b.score1), Number(b.score2)]
                : null;
        let medal = 0;
        let rowScore = 0;
        if (scenarioFirstScore && pred) {
            const o = getOutcome(pred, scenarioFirstScore);
            medal = medalFromOutcome(o);
            rowScore = _.get(factors, medal, 0) * factorId;
        }
        return {
            userId: p.userId,
            score1: b.score1,
            score2: b.score2,
            challengeId: firstChallengeId,
            medal,
            score: rowScore,
        };
    });

    const viewerParticipate =
        viewerUserId != null
            ? _.find(list, (p) => String(p.userId) === String(viewerUserId))
            : null;
    const viewerPicks =
        viewerParticipate != null && roundId != null
            ? _.map(segments, ({ bet }) => {
                  const rb = findBetOnChallenge(viewerParticipate, bet.challengeId, roundId);
                  return {
                      challengeId: bet.challengeId,
                      score1: rb.score1,
                      score2: rb.score2,
                  };
              })
            : [];

    return {
        mode: 'weekdayPath',
        variant,
        dateLabel,
        segments,
        participatesWithRank,
        usersBets,
        showPtsDelta: Boolean(baselineFinalState && baselineFinalState.length),
        viewerUserId,
        viewerPicks,
        multiGameDay: segments.length > 1,
    };
}
