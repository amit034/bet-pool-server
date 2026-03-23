/**
 * 1. SCORING ENGINE
 * Returns the points and medals for a specific prediction vs actual score.
 */
import _ from 'lodash';
function getOutcome(pred, actual) {
    const [ph, pa] = pred, [sh, sa] = actual;
    const pDiff = ph - pa, sDiff = sh - sa;

    if (ph === sh && pa === sa) return { pts: 3, g: 1, s: 1, b: 1 }; // Gold (implies Silver/Bronze)
    if (pDiff === sDiff) return { pts: 2, g: 0, s: 1, b: 1 };        // Silver
    if (pDiff !== 0 && Math.sign(pDiff) === Math.sign(sDiff)) return { pts: 1, g: 0, s: 0, b: 1 }; // Bronze
    return { pts: 0, g: 0, s: 0, b: 0 };
}

/**
 * 2. TIE-BREAKER COMPARISON
 * Returns true if rival is strictly better than the target based on Medal hierarchy.
 */
function isRivalBetter(target, rival) {
    if (rival.pts !== target.pts) return rival.pts > target.pts;
    if (rival.g !== target.g) return rival.g > target.g;
    if (rival.s !== target.s) return rival.s > target.s;
    return rival.b > target.b;
}

/**
 * Cartesian product of arrays: [ [a,b], [c,d] ] => [ [a,c], [a,d], [b,c], [b,d] ]
 */
function cartesianProduct(arrays) {
    return _.reduce(arrays, (acc, arr) =>
        _.flatMap(acc, (tuple) => _.map(arr, (x) => [...tuple, x])),
        [[]]
    );
}

/**
 * Compute rank of targetId in state (1-based; ties broken by isRivalBetter).
 */
function rankInState(state, targetId) {
    const uState = state.find(s => s.id === targetId);
    return state.filter(s => s.id !== targetId && isRivalBetter(uState, s)).length + 1;
}

function calculateAssignment(targetId, players, remainingGames) {
    const initialState = players.map(p => ({
        id: p.id,
        pts: p.points ?? 0,
        g: p.gold ?? 0,
        s: p.silver ?? 0,
        b: p.bronze ?? 0
    }));

    // Per-game: possible score lines and each one's impact (single-game view)
    const weekdayScenarios = remainingGames.map(game => {
        const {id: gameId, factor} = game;
        const uniqueScores = [...new Set(players.map(p => JSON.stringify(p.preds[gameId])))].map(JSON.parse);
        uniqueScores.push([9, 9]); // Default case where everyone misses

        const gameResults = uniqueScores.map(score => {
            const scenarioData = players.map(p => {
                const impact = getOutcome(p.preds[gameId], score);
                return {
                    id: p.id,
                    pts: impact.pts * factor,
                    g: impact.g * factor,
                    s: impact.s * factor,
                    b: impact.b * factor
                };
            });
            const uState = scenarioData.find(s => s.id === targetId);
            const rank = scenarioData.filter(s => s.id !== targetId && isRivalBetter(uState, s)).length + 1;
            return { score, rank, impacts: scenarioData };
        });

        return gameResults;
    });

    const pathScoreTuples = cartesianProduct(weekdayScenarios);

   
    const weekdayPaths = pathScoreTuples.map(pathScores => {
        const pathState = _.map(players, (player) => {
            const initialTarget = initialState.find(s => s.id === player.id);
            return _.reduce(pathScores, (agg, pathScore) => {
                const impact = _.find(_.get(pathScore, 'impacts'), (impact) => impact.id === player.id);
                return {
                    id: player.id,
                    pts: agg.pts + impact.pts,
                    g: agg.g + impact.g,
                    s: agg.s + impact.s,
                    b: agg.b + impact.b
                };
            }, initialTarget);
        })

        return {
            path: pathScores,
            pathLabel: pathScores.map(({score}) => `${score[0]}-${score[1]}`).join(' · '),
            rank: rankInState(pathState, targetId),
            finalState: pathState,
        };
    });

    const weekdayBest = weekdayPaths.length > 0 ? _.minBy(weekdayPaths, 'rank') : null;
    const weekdayWorst = weekdayPaths.length > 0 ? _.maxBy(weekdayPaths, 'rank') : null;

    return {  
        best: weekdayBest,
        worst: weekdayWorst
    };
}

export { calculateAssignment, getOutcome };
