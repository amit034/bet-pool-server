/**
 * User Metrics Tool
 * 
 * Analyzes user performance metrics including scores, rankings, and individual performance
 */

const { BaseAnalyticsTool } = require('./BaseAnalyticsTool');
const _ = require('lodash');

class UserMetricsTool extends BaseAnalyticsTool {
    constructor() {
        super(
            'user_metrics',
            `Analyzes user performance metrics in betting pools. Can answer questions like:
            - Who has the highest score overall?
            - Who has the highest score in a specific round?
            - What are the top performers in a pool?
            - How is a specific user performing?
            - What are the user rankings?
            
            Input should be a JSON object with:
            - poolId (required): The pool ID to analyze
            - userId (optional): Specific user to focus on
            - roundNumber (optional): Specific round to analyze
            - limit (optional): Number of top users to return (default: 10)
            - question (optional): Specific question being asked for better context`
        );
    }

    async _call(input) {
        try {
            const params = typeof input === 'string' ? JSON.parse(input) : input;
            const { poolId, userId, roundNumber, limit = 10, question } = params;

            if (!poolId) {
                throw new Error('poolId is required');
            }

            const participantsData = await this.getPoolParticipantsData(poolId);
            const participantsWithPositions = this.calculateRoundPositions(participantsData);

            let results = {};

            // Overall highest score
            if (!roundNumber && !userId) {
                const topPerformers = _.orderBy(participantsWithPositions, ['score'], ['desc'])
                    .slice(0, limit)
                    .map((p, index) => ({
                        position: index + 1,
                        userId: p.userId,
                        username: p.username,
                        firstName: p.firstName,
                        lastName: p.lastName,
                        totalScore: p.score,
                        medals: p.medals,
                        rounds: p.rounds.length,
                        isBot: p.isBot
                    }));

                results.overallLeaderboard = topPerformers;
                results.highestScore = topPerformers[0];
            }

            // Specific round analysis
            if (roundNumber) {
                const roundIndex = roundNumber - 1;
                const roundPerformers = participantsWithPositions
                    .filter(p => p.rounds[roundIndex])
                    .map(p => ({
                        userId: p.userId,
                        username: p.username,
                        firstName: p.firstName,
                        lastName: p.lastName,
                        roundScore: p.rounds[roundIndex].score,
                        position: p.rounds[roundIndex].positions?.current || 'N/A',
                        cumulativeScore: p.rounds[roundIndex].positions?.cumulativeScore || 0,
                        medals: p.rounds[roundIndex].medals,
                        bets: p.rounds[roundIndex].bets.length,
                        isBot: p.isBot
                    }))
                    .sort((a, b) => b.roundScore - a.roundScore)
                    .slice(0, limit);

                results.roundLeaderboard = roundPerformers;
                results.roundHighestScore = roundPerformers[0];
            }

            // Specific user analysis
            if (userId) {
                const user = participantsWithPositions.find(p => p.userId === userId);
                if (user) {
                    const userAnalysis = {
                        userId: user.userId,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        totalScore: user.score,
                        medals: user.medals,
                        isBot: user.isBot,
                        roundsPlayed: user.rounds.length,
                        averageRoundScore: _.meanBy(user.rounds, 'score'),
                        bestRound: _.maxBy(user.rounds, 'score'),
                        worstRound: _.minBy(user.rounds, 'score'),
                        currentPosition: null,
                        roundByRoundPerformance: user.rounds.map((round, index) => ({
                            round: index + 1,
                            score: round.score,
                            position: round.positions?.current || 'N/A',
                            medals: round.medals,
                            bets: round.bets.length
                        }))
                    };

                    // Calculate current overall position
                    const overallRankings = _.orderBy(participantsWithPositions, ['score'], ['desc']);
                    const userPosition = overallRankings.findIndex(p => p.userId === userId) + 1;
                    userAnalysis.currentPosition = userPosition;

                    results.userAnalysis = userAnalysis;
                } else {
                    results.error = `User with ID ${userId} not found in pool ${poolId}`;
                }
            }

            // Add some general statistics
            results.poolStatistics = {
                totalParticipants: participantsWithPositions.length,
                totalRounds: Math.max(...participantsWithPositions.map(p => p.rounds.length)),
                averageScore: _.meanBy(participantsWithPositions, 'score'),
                highestPossibleScore: Math.max(...participantsWithPositions.map(p => p.score)),
                activeBots: participantsWithPositions.filter(p => p.isBot).length
            };

            const context = question || 
                (roundNumber ? `Round ${roundNumber} performance analysis` : 
                 userId ? `User ${userId} performance analysis` : 
                 'Overall pool performance analysis');

            return this.formatResponse(results, context);

        } catch (error) {
            return this.formatResponse({ 
                error: error.message,
                tool: 'UserMetricsTool'
            }, 'Error occurred during analysis');
        }
    }
}

module.exports = { UserMetricsTool };
