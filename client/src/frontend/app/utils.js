'use strict';
import _ from 'lodash';
import {scoreFromPrediction, challengeForScoring, DEFAULT_POOL_FACTORS, SCORING_MODE} from './utils/betScoring';

/**
 * Get the participates with their rank by sorting the participates by the score and medals and return the target player state with the rank.
 * @param participates - participates
 * @returns {Array} - participates with rank
 */
function getParticipatesWithRank(participates) {
    if(_.isEmpty(participates)) {
        return [];
    }
    const sortedParticipates = _.orderBy(participates, ['score', 'medals.3', 'medals.2', 'medals.1'], ['desc', 'desc', 'desc', 'desc']);
    const first = _.first(_.filter(sortedParticipates, {isBot: false}));
    if (_.isNil(first)) {
        return [];
    }
    const {participatesWithRank} = _.reduce(sortedParticipates, (agg, participate) => {
        if (!agg.prvIsBot){
            agg.cnt++;
        }
        if (!_.isEqual(participate.medals, agg.medals) || agg.prvIsBot) {
            if (participate.isBot) {
                agg.rank = '-';
            } else {
                agg.rank = agg.cnt;
                agg.medals = participate.medals;
            }
        }
        agg.prvIsBot  = participate.isBot;
        agg.participatesWithRank.push(_.assign(participate, {rank: agg.rank}));
        return agg;
    }, {participatesWithRank: [], rank: 1, cnt: 0, prvIsBot: first.isBot, medals: first.medals});
    return participatesWithRank;
}

/**
 * Get rank stats for a specific round (for round header and bars).
 * Best/worst case depend only on remaining active (open) games – finished games no longer affect position.
 * @param {Array} participates - pool participants with rounds[roundId].bets / score
 * @param {number} roundId - 0-based round index
 * @param {string} userId - current user id
 * @param {Array} [roundBets] - bets for this round (each with challenge.isOpen). If provided, best/worst are derived from open games only.
 */
function getRoundRankStats(participates, roundId, userId, roundBets) {
    if (_.isEmpty(participates)) {
        return { currentRank: 1, bestCaseRank: 1, worstCaseRank: 1, maxRank: 1, openGamesCount: 0 };
    }
    const roundScores = _.map(participates, (p) => {
        const roundData = _.get(p, ['rounds', roundId], { score: 0, bets: [] });
        let roundScore = _.isNumber(roundData.score) ? roundData.score : 0;
        if (roundScore === 0 && _.isArray(roundData.bets)) {
            roundScore = _.sumBy(roundData.bets, (b) => (b && b.score) ? b.score : 0);
        }
        return { userId: p.userId, score: roundScore, isBot: p.isBot };
    });
    const sorted = _.orderBy(roundScores, ['score'], ['desc']);
    const nonBotCount = _.size(_.filter(sorted, (s) => !s.isBot));
    const maxRank = Math.max(1, nonBotCount);
    let currentRank = 1;
    let rank = 1;
    for (let i = 0; i < sorted.length; i++) {
        if (!sorted[i].isBot) {
            if (sorted[i].userId === userId) currentRank = rank;
            rank++;
        }
    }

    const openGamesCount = _.isArray(roundBets)
        ? _.size(_.filter(roundBets, (b) => _.get(b, 'challenge.isOpen') === true))
        : 0;

    let bestCaseRank = currentRank;
    let worstCaseRank = currentRank;
    if (openGamesCount > 0) {
        bestCaseRank = Math.max(1, currentRank - openGamesCount);
        worstCaseRank = Math.min(maxRank, currentRank + openGamesCount);
    }

    return { currentRank, bestCaseRank, worstCaseRank, maxRank, openGamesCount };
}

/**
 * 1. SCORING ENGINE
 * Returns the points and medals for a specific prediction vs actual score.
 */
function getOutcome(pred, actual) {
    if (!_.isNil(pred)) {
        const [ph, pa] = pred, [sh, sa] = actual;
        const pDiff = ph - pa, sDiff = sh - sa;

        if (ph === sh && pa === sa) return { pts: 3, g: 1, s: 0, b: 0 }; // Gold (implies Silver/Bronze)
        if (pDiff === sDiff) return { pts: 2, g: 0, s: 1, b: 0 };        // Silver
        if (pDiff !== 0 && Math.sign(pDiff) === Math.sign(sDiff)) return { pts: 1, g: 0, s: 0, b: 1 }; // Bronze
    }
    return { pts: 0, g: 0, s: 0, b: 0 };
}

/**
 * 2. TIE-BREAKER COMPARISON
 * Returns true if rival is strictly better than the target based on Medal hierarchy.
 */
function isRivalBetter(target, rival) {
    if (rival.score !== target.score) return rival.score > target.score;
    if (rival.medals['3'] !== target.medals['3']) return rival.medals['3'] > target.medals['3'];
    if (rival.medals['2'] !== target.medals['2']) return rival.medals['2'] > target.medals['2'];
    return rival.medals['1'] > target.medals['1'];
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
    const uState = _.get(state, `[${targetId}]`);
    return state.filter(s => s.id !== targetId && isRivalBetter(uState, s)).length + 1;
}


/**
 * Calculate the impact of a game on the players predictions and return the target player state with the rank to gather with the complete impacts on the players.
 * @param targetId - current user id
 * @param gameScore - game score
 * @param factorId - factor id
 * @param players - players
 * @param predictions - predictions
 * @returns {Object} - { gameScoreLabel: string, gameScore: [number, number], impacts: Array, targetState: Object }
 */
function normalizeMatchScore(score1, score2) {
    const h = _.toInteger(score1, 10);
    const a = _.toInteger(score2, 10);
    return [_.isNaN(h) ? 0 : h, _.isNaN(a) ? 0 : a];
}

function scoreLineLabel(score1, score2) {
    const [h, a] = normalizeMatchScore(score1, score2);
    return `${h}-${a}`;
}

function challengeActualScore(challenge) {
    const ch = challenge || {};
    const game = ch.game || {};
    return normalizeMatchScore(
        ch.score1 != null ? ch.score1 : game.homeTeamScore,
        ch.score2 != null ? ch.score2 : game.awayTeamScore
    );
}

function calculateGoalImpact(targetId, gameScore, challenge, players, predictions, poolFactors, scoringMode) {
    const factorId = _.get(challenge, 'factorId', 1);
    const factors = poolFactors || DEFAULT_POOL_FACTORS;
    const mode = _.isNil(scoringMode) ? SCORING_MODE.CLASSIC : scoringMode;
    const safeScore = normalizeMatchScore(gameScore[0], gameScore[1]);
    const chForScore = challengeForScoring(challenge, safeScore);
    const scenarioData = _.reduce(players, (agg, player) => {
        const {userId, isBot} = player;
        const monkey = _.get(predictions, ['2'], null);
        const prediction = _.get(predictions, `[${userId}]`, monkey);
        const impact = getOutcome(prediction, safeScore);
        const computed = scoreFromPrediction(prediction, safeScore, chForScore, factors, mode);
        agg.push({
            userId, isBot,
            score: computed.score,
            medals: {
                1: impact.b * (factorId * 10),
                2: impact.s * (factorId * 10),
                3: impact.g * (factorId * 10)
            }
        });
        return agg;
    }, []);
    const participatesWithRank = getParticipatesWithRank(scenarioData);
    const targetState = _.find(participatesWithRank, { userId: targetId });
    return {
        gameScoreLabel: scoreLineLabel(safeScore[0], safeScore[1]),
        gameScore: safeScore,
        impacts: scenarioData,
        targetState: targetState || null
    };
}

/**
 * Calculate the impact of the given round on the target player.
 * by go over each bet and collect a list of all unique players predictions for the given challenge plus the current score line, home team next score line and away team next score line.
 * and clculate the result impact. then find the best worst and current game results scenarios for the target player.
 * @param targetId - current user id
 * @param players - each { id, points, gold, silver, bronze, preds } where preds[challengeId] = [score1, score2] from bet
 * @param remainingGames - open games, each { id: challengeId, factor }
 */
function calculatelImpact(targetId, players, bets, roundId, {poolFactors, scoringMode} = {}) {
    if (_.isEmpty(players) || _.isEmpty(_.filter(bets, 'closed')) || roundId < 0) {
        return { best: null, worst: null };
    }
    const initialState = _.reduce(players, (playerAgg, player) => {
        const {userId, isBot} = player;
        const playerInitState = _.reduce(_.slice(player.rounds, 0, roundId + 1), (agg, round) => {
            if (roundId < round.round)  return agg;
            if (round.round === roundId) {
                return {
                    userId, isBot,
                    score: agg.score,
                    medals: agg.medals,
                    currentPredictions: _.reduce(round.bets, (preds, bet) => {
                        preds[bet.challengeId] = [bet.score1, bet.score2];
                        return preds;
                    }, {})
                }
            }
            return {
                score: agg.score + round.score,
                medals: {
                    1: agg.medals['1'] + round.medals['1'],
                    2: agg.medals['2'] + round.medals['2'],
                    3: agg.medals['3'] + round.medals['3']
                }, 
                currentPredictions: agg.currentPredictions
            }
        }, { score: 0, medals: {1: 0, 2: 0, 3: 0}, currentPredictions: {}});
        playerAgg[userId] = ({ userId, ...playerInitState });
        return playerAgg;
    }, {});

    const weekdayScenarios = createWeekDaySenarios(targetId, players, bets, initialState, poolFactors, scoringMode);

    const bestScenario = _.map(weekdayScenarios, 'best');
    const worstScenario = _.map(weekdayScenarios, 'worst');
    const currentScenario = _.map(weekdayScenarios, 'current');
    const weekPath = createWeekDayPath(players, initialState, targetId)
    const bestPath = weekPath(bestScenario);
    const worstPath = weekPath(worstScenario);
    const currentPath = weekPath(currentScenario);
    return {
        best: bestPath,
        worst: worstPath,
        current: currentPath,
        initial: getParticipatesWithRank(_.values(initialState))
    };
    // const pathScoreTuples = cartesianProduct(weekdayScenarios);

   
    // const weekdayPaths = _.map(pathScoreTuples, (pathScores) => {
    //     const pathState = _.map(players, (player) => {
    //         const {userId} = player;
    //         const initialTarget = initialState[userId];
    //         return _.reduce(pathScores, (agg, pathScore) => {
    //             const impact = _.get(pathScore, `impacts[${userId}]`);
    //             return {
    //                 userId, 
    //                 score: agg.score + impact.pts,
    //                 medals: {
    //                     1: agg.medals['1'] + impact.b ,
    //                     2: agg.medals['2'] + impact.s,
    //                     3: agg.medals['3'] + impact.g
    //                 }
    //             };
    //         }, initialTarget);
    //     })

    //     const {participantsWithRank} = getParticipatesWithRank(pathState);

    //     return {
    //         path: pathScores,
    //         pathLabel: pathScores.map(({score}) => `${score[0]}-${score[1]}`).join(' · '),
    //         rank: _.get(_.find(participantsWithRank, {userId: targetId}), 'rank'),
    //         finalState: participantsWithRank,
    //     };
    // });

    // const weekdayBest = weekdayPaths.length > 0 ? _.minBy(weekdayPaths, 'rank') : null;
    // const weekdayWorst = weekdayPaths.length > 0 ? _.maxBy(weekdayPaths, 'rank') : null;

    // return {  
    //     best: weekdayBest,
    //     worst: weekdayWorst
    // };
}

/**
 * Create the week day path for the given path scores. by go over each path and aggregate the impact of the path scores on the target player.
 * and return the path state with the target player state and the final state of the players with their ranks.
 * @param players - players
 * @param initialState - initial state
 * @param targetId - target id
 * @returns {Function} - week day path
 */
function createWeekDayPath(players, initialState, targetId) {
    return (pathScores) => {
        if (_.isEmpty(pathScores)) return null;
        const pathState = _.map(players, (player) => {
            const { userId, isBot } = player;
            const initialTarget = _.find(initialState, { userId }) || {
                userId,
                isBot,
                score: 0,
                medals: {'1': 0, '2': 0, '3': 0}
            };
            return _.reduce(_.compact(pathScores), (agg, pathScore) => {
                if (!pathScore || !_.isArray(pathScore.impacts)) {
                    return agg;
                }
                const {impacts} = pathScore;
                const impact = _.find(impacts, {userId});

                if (!impact || !agg) return agg;
                const currentScore = agg.score;
                return {
                    userId, isBot,
                    score: currentScore + impact.score,
                    medals: {
                        1: agg.medals['1'] + impact.medals['1'],
                        2: agg.medals['2'] + impact.medals['2'],
                        3: agg.medals['3'] + impact.medals['3'],
                    }
                };
            }, initialTarget);
        });

        const participantsWithRank = getParticipatesWithRank(pathState);
        const targetState = _.find(participantsWithRank, { userId: targetId });
        return {
            path: pathScores,
            focusedLabel: _.get(_.first(pathScores), 'gameScoreLabel', 'N/A')   ,
            pathLabel: _.map(_.compact(pathScores), (ps) => {
                const gs = ps.gameScore || normalizeMatchScore(0, 0);
                return scoreLineLabel(gs[0], gs[1]);
            }).join(' · '),
            rank: _.get(targetState, 'rank'),
            targetState,
            finalState: participantsWithRank,
        };
    };
}

/**
 * build a list of all possible score lines that players predict and add more scorelines that nobady predict yet. 
 * to create a list of optional predictions for the given challenge.
 * @param playersPredictions - players predictions
 * @returns {Array} - optional predictions
 */
function getOptionalPredictions(playersPredictions) {
    const allPossible = _.flatMap(_.range(7), h => _.range(7).map(a => [h, a]));
    const playersPreds = _.values(playersPredictions);
    const availableWithUniqueDiffs = _.differenceWith(
        allPossible, 
        playersPreds, 
        (pos, pick) => {
          const posDiff = pos[0] - pos[1];
          const pickDiff = pick[0] - pick[1];
      
          if (posDiff === 0 && pickDiff === 0) {
            // For draws, only remove if it's the EXACT same score (e.g., 1-1 vs 1-1)
            return _.isEqual(pos, pick);
          }
          
          // For wins/losses, remove if the Goal Difference matches
          return posDiff === pickDiff;
        }
      );
      
      // Now your find logic works perfectly
    const minHomeWin = _.find(availableWithUniqueDiffs, ([h, a]) => h > a);
    const minDraw    = _.find(availableWithUniqueDiffs, ([h, a]) => h === a);
    const minAwayWin = _.find(availableWithUniqueDiffs, ([h, a]) => a > h);
      
    return _.compact(_.concat(playersPreds, [minHomeWin, minDraw, minAwayWin]));
}

/**
 * Create the week day scenarios by go over each bet and collect a list of all unique players predictions for the given challenge plus the current score line, home team next score line and away team next score line.
 * and clculate the result impact. then find the best worst and current game results scenarios for the target player.
 * @param targetId - target id
 * @param players - players
 * @param bets - bets
 * @param initialState - initial state
 * @returns {Array} - week day scenarios
 */
function createWeekDaySenarios(targetId, players, bets, initialState, poolFactors, scoringMode) {
    const factorSum = _.sumBy(bets, 'challenge.factorId');
    return _.map(_.filter(bets, 'closed'), (bet) => {
        const challenge = bet.challenge || {};
        const challengeId = bet.challengeId || challenge.id;
        const factorId = challenge.factorId || 1;
        const game = challenge.game || {};
        const status = game.status || challenge.status;
        const [hTeamScore, aTeamScore] = challengeActualScore(challenge);
        const urgency = factorSum > 0 ? factorId / factorSum : 0;
        const playersPredictions = getChallangePredictions(initialState, challengeId);
        const currentScoreLine = [hTeamScore, aTeamScore];
        const homeTeamNextScoreLine = [hTeamScore + 1, aTeamScore];
        const awayTeamNextScoreLine = [hTeamScore, aTeamScore + 1];
        const preds = getOptionalPredictions(_.uniqWith(_.values(playersPredictions), _.isEqual));
        const uniqueScores = _.uniqWith(_.concat( preds, [currentScoreLine, homeTeamNextScoreLine, awayTeamNextScoreLine]), _.isEqual);
        const gameResults = uniqueScores.map((score) => {
            const impact = calculateGoalImpact(
                targetId, score, bet.challenge, players, playersPredictions, poolFactors, scoringMode
            );
            return {
                ...impact,
                factorId
            };
        });
        const currentLabel = scoreLineLabel(currentScoreLine[0], currentScoreLine[1]);
        const current = _.find(gameResults, {gameScoreLabel: currentLabel}) || _.first(gameResults);
        const ranked = _.filter(gameResults, (r) => r && r.targetState);
        const worst = status !== 'FINISHED1' && ranked.length
            ? _.minBy(ranked, (r) => r.targetState.score)
            : current;
        const best = status !== 'FINISHED1' && ranked.length
            ? _.maxBy(ranked, (r) => r.targetState.score)
            : current;
        return { challengeId, factorId, best, worst, current, gameResults, bet, urgency};
    });
}

/**
 * Sort the game paths by the score key and add the difference in rank and score.
 * @param initialRankState - initial rank state of the players
 * @param gamePaths - game paths
 * @param targetId - target id
 * @param factorId - factor id
 * @param urgency - urgency
 * @returns {Array} - sorted game paths
 */
export function sortAddDiffRankAndScore(initialRankState, gamePaths, targetId, factorId, urgency) {
    if (_.isEmpty(initialRankState) || _.isEmpty(gamePaths)) return [];

    const initialTarget = _.find(initialRankState, { userId: targetId });
    if (!initialTarget) return [];

    const MIN_SCORING_STEP = 10 * factorId; 

    return _.map(_.compact(gamePaths), (weekdayPath) => {
        if (!weekdayPath) {
            return null;
        }
        const {targetState, finalState, gameResult} = weekdayPath;
        const label = weekdayPath.label || weekdayPath.gameScoreLabel || '0-0';

        const impacts = _.get(gameResult, 'impacts', []);
        const myImpact = _.find(impacts, { userId: targetId });
        const myGain = myImpact ? myImpact.score : 0;
        const rivalGains = [];
        // calculate the score impact by the current gap from the target and the scoring step to get the weight of the rival gain on the total impact
        const totalImpact = _.reduce(initialRankState, (sum, initialRival) => {
            if (initialRival.userId === targetId) return sum;
            const rivalImpact = _.find(impacts, { userId: initialRival.userId }, {score: 0});
            const rivalGain = rivalImpact ? rivalImpact.score : 0;
            const relativeGain = myGain - rivalGain;
            const currentGap = Math.abs(initialRival.score - initialTarget.score);
            rivalGains.push(JSON.stringify([currentGap, relativeGain]));
            const weight = urgency / (currentGap + MIN_SCORING_STEP);
            return sum + (relativeGain * weight);
        }, 0);

        // --- SCORELINE SORTING LOGIC ---
        // Split "3-2" into [3, 2]
        const [home, away] = label.split('-').map(Number);
        // add power 3-2 will be 32 and 2-3 will be -32
        const sortKey = scoreKey({ home, away });
        
        return {
            ...weekdayPath,
            gameScoreLabel: label,
            impactValue: totalImpact,
            rivalGains,
            sortKey  
        };
    }).sort((a, b) => {
        return b.sortKey - a.sortKey;
    }).filter(Boolean);
}

/**
 * Create a score key for the given score. in away where if home win power the home score by then and if away win power the away score by 10 
 * example 3-2 will be 32 and 2-3 will be -32
 * @param home - home score
 * @param away - away score
 * @returns {number} - score key
 */
function scoreKey({ home, away }) {
    
    const max = Math.max(home, away);
    const min = Math.min(home, away);
    const sign = home > away ? 1 : (away > home ? -1 : 0); 
    const effectiveSign = (home === away && home > 0) ? 0.01 : sign;
    
    return ((max * 10) + min) * effectiveSign
}

/**
 * Get all posisible game paths for the focused challenge and all oother challenges current scores and collect there impact on the target player
 * by checking impacts of all other players and compare them to the target player.
 * @param targetId - current user id
 * @param players - each { id, points, gold, silver, bronze, preds } where preds[challengeId] = [score1, score2] from bet
 * @param bets - bets for the week
 * @param initialState - initial state of the players
 * @param challengeId - focused challenge id
 * @returns {Object} - { gamePaths: sorted game paths by game score distance for 0-0, homeTeamNext: game path for home team next score, awayTeamNext: game path for away team next score }
 */

function getWeekPathWithFocused(targetId, players, bets, initialState, challengeId, {poolFactors, scoringMode} = {}) {
    if (_.isEmpty(players) || _.isEmpty(_.filter(bets, 'closed')) || _.isEmpty(initialState) || _.isNil(initialState) || _.isNil(challengeId)) {
        return null;
    }
    const weekdayScenarios = createWeekDaySenarios(targetId, players, bets, initialState, poolFactors, scoringMode);
    if (!_.find(weekdayScenarios, {challengeId})) {
        return null;
    }
    const [[focused], others] = _.partition(weekdayScenarios, { challengeId });
    const urgency = _.get(focused, 'urgency');
    const gameResults = _.get(focused, 'gameResults');
    const weekPath = createWeekDayPath(players, initialState, targetId);
    const othersCurrent = _.compact(_.map(others, 'current'));
    const gamePaths = _.compact(_.map(gameResults, (gameResult) => {
        if (!gameResult || gameResult.gameScoreLabel == null) {
            return null;
        }
        const path = weekPath(_.compact([gameResult, ...othersCurrent]));
        if (!path) {
            return null;
        }
        return {...path, gameScoreLabel: gameResult.gameScoreLabel, gameResult};
    }));
    const factorId = _.get(focused, 'factorId');
    const sortedGamePaths = sortAddDiffRankAndScore(initialState, gamePaths, targetId, factorId, urgency);
    const status = _.get(focused, 'bet.challenge.game.status');
    const currentScenario = focused.current || _.first(gameResults);
    const [home = 0, away = 0] = _.get(currentScenario, 'gameScore', challengeActualScore(_.get(focused, 'bet.challenge')));
    const currentScore = [home, away];
    const nextHomeTeamScore = [home + 1, away];
    const nextAwayTeamScore = [home, away + 1];
    const homeTeamNext = status !== 'FINISHED1'
        ? getDiffScorePath(sortedGamePaths, nextHomeTeamScore, currentScore, targetId)
        : null;
    const awayTeamNext = status !== 'FINISHED1'
        ? getDiffScorePath(sortedGamePaths, nextAwayTeamScore, currentScore, targetId)
        : null;
    return {gamePaths: sortedGamePaths, homeTeamNext, awayTeamNext};
}

/**
 * Get the game path for the given score and compare it to current score.
 * @param sortedGamePaths - sorted game paths by game score distance for 0-0
 * @param scoreA - score A next score
 * @param scoreB - score B current score
 * @returns {Object} - { gamePath, scoreDiff, rankDiff }
 */
const getDiffScorePath = (sortedGamePaths, nextScore, currentScore, targetId) => {
    if (_.isEmpty(sortedGamePaths)) {
        return null;
    }
    const nextLabel = scoreLineLabel(nextScore[0], nextScore[1]);
    const currentLabel = scoreLineLabel(currentScore[0], currentScore[1]);
    const nextPath = _.find(sortedGamePaths, {gameScoreLabel: nextLabel});
    const currentPath = _.find(sortedGamePaths, {gameScoreLabel: currentLabel});
    if (!nextPath || !currentPath) {
        return null;
    }
    const nextState = _.get(nextPath, 'targetState', null);
    const currentState = _.get(currentPath, 'targetState', null);
    let scoreDiff = (nextState?.score || 0) - (currentState?.score || 0);
    const nextImpact = _.find(_.get(nextPath, 'gameResult.impacts'), {userId: targetId});
    const curImpact = _.find(_.get(currentPath, 'gameResult.impacts'), {userId: targetId});
    if (nextImpact && curImpact) {
        scoreDiff = (nextImpact.score || 0) - (curImpact.score || 0);
    }
    const nextRank = nextState?.rank;
    const currentRank = currentState?.rank;
    const rankDiff = (nextRank != null && currentRank != null) ? -(nextRank - currentRank) : 0;
    return {...nextPath, scoreDiff, rankDiff};
};

/**
 * Get the all players predictions for the given challenge id and return them as an object with user id as the key and the prediction as the value.
 * @param initialState - initial state of the players
 * @param challengeId - challenge id
 * @returns {Object} - { predictions: { userId: [score1, score2] } }
 */
function getChallangePredictions(initialState, challengeId) {
    return  _.reduce(initialState, (agg, playerState) => {
        const pred = _.get(playerState, `currentPredictions[${challengeId}]`, null);
        if (pred) {
            agg[[playerState.userId]] = pred;
        }
        return agg;
    }, {});
}

/**
 * Label for the earlier fixture between the same teams in the same event (e.g. first leg).
 * @param {Object} previousLeg - { homeTeam, awayTeam, score1, score2 } from API
 * @returns {{ text: string, title: string } | null}
 */
function formatPreviousLegUi(previousLeg) {
    if (!previousLeg) return null;
    const s1 = previousLeg.score1;
    const s2 = previousLeg.score2;
    if (!_.isFinite(_.toNumber(s1)) || !_.isFinite(_.toNumber(s2))) return null;
    const h = _.get(previousLeg, 'homeTeam.shortName') || _.get(previousLeg, 'homeTeam.name', '');
    const a = _.get(previousLeg, 'awayTeam.shortName') || _.get(previousLeg, 'awayTeam.name', '');
    return { text: `Prev. leg ${h} ${s1}-${s2} ${a}`, title: `${h} ${s1}-${s2} ${a}` };
}

export { calculatelImpact, getOutcome , getRoundRankStats, getParticipatesWithRank, calculateGoalImpact, getWeekPathWithFocused, formatPreviousLegUi};

    

    

