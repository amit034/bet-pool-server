/**
 * Recovery Analysis Tool
 * 
 * Analyzes dramatic position changes and recovery patterns between rounds
 */

const { BaseAnalyticsTool } = require('./BaseAnalyticsTool');
const _ = require('lodash');

class RecoveryAnalysisTool extends BaseAnalyticsTool {
    constructor() {
        super(
            'recovery_analysis',
            `Analyzes dramatic position changes and recovery patterns in betting pools. Can answer questions like:
            - Who made the biggest recovery (position jump) between rounds?
            - Who had the biggest fall in rankings?
            - What are the most dramatic position changes?
            - Who recovered from a low position to high position?
            - What are the comeback stories?
            
            Input should be a JSON object with:
            - poolId (required): The pool ID to analyze
            - minPositionJump (optional): Minimum position jump to consider (default: 3)
            - fromRound (optional): Starting round for analysis
            - toRound (optional): Ending round for analysis
            - userId (optional): Specific user to analyze
            - recoveryType (optional): 'positive' for recoveries, 'negative' for falls, 'both' for all
            - limit (optional): Number of results to return (default: 10)`
        );
    }

    async _call(input) {
        try {
            const params = typeof input === 'string' ? JSON.parse(input) : input;
            const { 
                poolId, 
                minPositionJump = 3, 
                fromRound, 
                toRound, 
                userId,
                recoveryType = 'both',
                limit = 10
            } = params;

            if (!poolId) {
                throw new Error('poolId is required');
            }

            const participantsData = await this.getPoolParticipantsData(poolId);
            const participantsWithPositions = this.calculateRoundPositions(participantsData);

            const recoveryAnalysis = this.analyzeRecoveries(
                participantsWithPositions, 
                minPositionJump,
                fromRound,
                toRound,
                userId,
                recoveryType
            );

            const results = {
                recoveryAnalysis,
                summary: this.generateRecoverySummary(recoveryAnalysis),
                poolInfo: {
                    totalParticipants: participantsWithPositions.length,
                    totalRounds: Math.max(...participantsWithPositions.map(p => p.rounds.length)),
                    analysisRange: {
                        fromRound: fromRound || 1,
                        toRound: toRound || Math.max(...participantsWithPositions.map(p => p.rounds.length))
                    }
                }
            };

            // Limit results
            if (results.recoveryAnalysis.biggestRecoveries) {
                results.recoveryAnalysis.biggestRecoveries = results.recoveryAnalysis.biggestRecoveries.slice(0, limit);
            }
            if (results.recoveryAnalysis.biggestFalls) {
                results.recoveryAnalysis.biggestFalls = results.recoveryAnalysis.biggestFalls.slice(0, limit);
            }

            return this.formatResponse(results, 'Recovery and position change analysis');

        } catch (error) {
            return this.formatResponse({ 
                error: error.message,
                tool: 'RecoveryAnalysisTool'
            }, 'Error occurred during recovery analysis');
        }
    }

    /**
     * Analyze recoveries and position changes
     */
    analyzeRecoveries(participantsData, minPositionJump, fromRound, toRound, userId, recoveryType) {
        const recoveries = [];
        const falls = [];

        participantsData.forEach(participant => {
            if (userId && participant.userId !== userId) return;

            const rounds = participant.rounds;
            
            for (let i = 1; i < rounds.length; i++) {
                const previousRound = rounds[i - 1];
                const currentRound = rounds[i];
                
                // Skip if we don't have position data for both rounds
                if (!previousRound.positions || !currentRound.positions) continue;
                
                // Apply round filters
                if (fromRound && i < fromRound - 1) continue;
                if (toRound && i > toRound - 1) continue;

                const previousPosition = previousRound.positions.current;
                const currentPosition = currentRound.positions.current;
                const positionChange = previousPosition - currentPosition; // Positive means improvement (lower position number)

                if (Math.abs(positionChange) >= minPositionJump) {
                    const changeData = {
                        userId: participant.userId,
                        username: participant.username,
                        firstName: participant.firstName,
                        lastName: participant.lastName,
                        fromRound: i,
                        toRound: i + 1,
                        previousPosition,
                        currentPosition,
                        positionChange,
                        positionJump: Math.abs(positionChange),
                        previousScore: previousRound.positions.cumulativeScore,
                        currentScore: currentRound.positions.cumulativeScore,
                        scoreChange: currentRound.positions.cumulativeScore - previousRound.positions.cumulativeScore,
                        roundScore: currentRound.score,
                        isBot: participant.isBot,
                        type: positionChange > 0 ? 'recovery' : 'fall'
                    };

                    if (positionChange > 0) {
                        recoveries.push(changeData);
                    } else {
                        falls.push(changeData);
                    }
                }
            }
        });

        const result = {};

        if (recoveryType === 'positive' || recoveryType === 'both') {
            result.biggestRecoveries = _.orderBy(recoveries, ['positionJump', 'scoreChange'], ['desc', 'desc']);
        }

        if (recoveryType === 'negative' || recoveryType === 'both') {
            result.biggestFalls = _.orderBy(falls, ['positionJump', 'scoreChange'], ['desc', 'asc']);
        }

        // Find consecutive recoveries (comeback stories)
        result.comebackStories = this.findComebackStories(participantsData, minPositionJump);

        return result;
    }

    /**
     * Find users who made consistent comebacks over multiple rounds
     */
    findComebackStories(participantsData, minPositionJump) {
        const comebacks = [];

        participantsData.forEach(participant => {
            const rounds = participant.rounds;
            if (rounds.length < 3) return;

            // Find the lowest position (highest number) the user reached
            const positions = rounds
                .filter(r => r.positions)
                .map((r, index) => ({ round: index + 1, position: r.positions.current, score: r.positions.cumulativeScore }));

            if (positions.length < 3) return;

            const lowestPoint = _.maxBy(positions, 'position');
            const finalPosition = _.last(positions);

            if (lowestPoint && finalPosition && 
                lowestPoint.position - finalPosition.position >= minPositionJump &&
                lowestPoint.round < finalPosition.round) {
                
                comebacks.push({
                    userId: participant.userId,
                    username: participant.username,
                    firstName: participant.firstName,
                    lastName: participant.lastName,
                    lowestPosition: lowestPoint.position,
                    lowestPositionRound: lowestPoint.round,
                    finalPosition: finalPosition.position,
                    finalRound: finalPosition.round,
                    totalRecovery: lowestPoint.position - finalPosition.position,
                    roundsToRecover: finalPosition.round - lowestPoint.round,
                    scoreAtLowest: lowestPoint.score,
                    finalScore: finalPosition.score,
                    scoreGrowth: finalPosition.score - lowestPoint.score,
                    isBot: participant.isBot
                });
            }
        });

        return _.orderBy(comebacks, ['totalRecovery', 'scoreGrowth'], ['desc', 'desc']);
    }

    /**
     * Generate summary statistics for recoveries
     */
    generateRecoverySummary(recoveryAnalysis) {
        const summary = {};

        if (recoveryAnalysis.biggestRecoveries) {
            const recoveries = recoveryAnalysis.biggestRecoveries;
            summary.recoveryStats = {
                totalRecoveries: recoveries.length,
                averageRecoveryJump: _.meanBy(recoveries, 'positionJump'),
                largestRecovery: _.maxBy(recoveries, 'positionJump'),
                mostCommonRecoveryRound: _.chain(recoveries)
                    .groupBy('toRound')
                    .toPairs()
                    .maxBy(pair => pair[1].length)
                    .value()?.[0] || 'N/A'
            };
        }

        if (recoveryAnalysis.biggestFalls) {
            const falls = recoveryAnalysis.biggestFalls;
            summary.fallStats = {
                totalFalls: falls.length,
                averageFallDistance: _.meanBy(falls, 'positionJump'),
                largestFall: _.maxBy(falls, 'positionJump'),
                mostCommonFallRound: _.chain(falls)
                    .groupBy('toRound')
                    .toPairs()
                    .maxBy(pair => pair[1].length)
                    .value()?.[0] || 'N/A'
            };
        }

        if (recoveryAnalysis.comebackStories) {
            const comebacks = recoveryAnalysis.comebackStories;
            summary.comebackStats = {
                totalComebacks: comebacks.length,
                averageComebackDistance: _.meanBy(comebacks, 'totalRecovery'),
                longestComeback: _.maxBy(comebacks, 'totalRecovery'),
                fastestComeback: _.minBy(comebacks, 'roundsToRecover')
            };
        }

        return summary;
    }
}

module.exports = { RecoveryAnalysisTool };
