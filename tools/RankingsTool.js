/**
 * Rankings Tool
 * 
 * Provides detailed ranking analysis and leaderboard functionality
 */

const { BaseAnalyticsTool } = require('./BaseAnalyticsTool');
const _ = require('lodash');

class RankingsTool extends BaseAnalyticsTool {
    constructor() {
        super(
            'rankings',
            `Provides comprehensive ranking analysis and leaderboard functionality. Can answer questions like:
            - What are the current rankings?
            - How have rankings changed over time?
            - Who are the consistent performers?
            - What are the ranking trends?
            - Position stability analysis?
            
            Input should be a JSON object with:
            - poolId (required): The pool ID to analyze
            - rankingType (optional): 'current', 'historical', 'stability', 'trends'
            - limit (optional): Number of top positions to show (default: 10)
            - excludeBots (optional): Whether to exclude bots (default: false)
            - roundRange (optional): Object with 'from' and 'to' round numbers`
        );
    }

    async _call(input) {
        try {
            const params = typeof input === 'string' ? JSON.parse(input) : input;
            const { 
                poolId, 
                rankingType = 'current',
                limit = 10,
                excludeBots = false,
                roundRange
            } = params;

            if (!poolId) {
                throw new Error('poolId is required');
            }

            const participantsData = await this.getPoolParticipantsData(poolId);
            const participantsWithPositions = this.calculateRoundPositions(participantsData);
            
            let filteredData = excludeBots ? 
                participantsWithPositions.filter(p => !p.isBot) : 
                participantsWithPositions;

            const results = {};

            switch (rankingType) {
                case 'current':
                    results.currentRankings = this.getCurrentRankings(filteredData, limit);
                    break;
                case 'historical':
                    results.historicalRankings = this.getHistoricalRankings(filteredData, roundRange, limit);
                    break;
                case 'stability':
                    results.stabilityAnalysis = this.analyzeRankingStability(filteredData, limit);
                    break;
                case 'trends':
                    results.rankingTrends = this.analyzeRankingTrends(filteredData, limit);
                    break;
                default:
                    // Provide all ranking analyses
                    results.currentRankings = this.getCurrentRankings(filteredData, limit);
                    results.historicalRankings = this.getHistoricalRankings(filteredData, roundRange, limit);
                    results.stabilityAnalysis = this.analyzeRankingStability(filteredData, limit);
                    results.rankingTrends = this.analyzeRankingTrends(filteredData, limit);
            }

            return this.formatResponse(results, `Ranking analysis for pool ${poolId}`);

        } catch (error) {
            return this.formatResponse({ 
                error: error.message,
                tool: 'RankingsTool'
            }, 'Error occurred during ranking analysis');
        }
    }

    /**
     * Get current rankings based on total scores
     */
    getCurrentRankings(participantsData, limit) {
        const rankings = _.orderBy(participantsData, ['score'], ['desc'])
            .slice(0, limit)
            .map((participant, index) => ({
                position: index + 1,
                userId: participant.userId,
                username: participant.username,
                firstName: participant.firstName,
                lastName: participant.lastName,
                totalScore: participant.score,
                medals: participant.medals,
                totalMedals: (participant.medals['3'] || 0) + (participant.medals['2'] || 0) + (participant.medals['1'] || 0),
                roundsPlayed: participant.rounds.length,
                averageRoundScore: _.meanBy(participant.rounds, 'score'),
                isBot: participant.isBot,
                trend: this.calculatePositionTrend(participant)
            }));

        return {
            leaderboard: rankings,
            metadata: {
                totalParticipants: participantsData.length,
                timestamp: new Date().toISOString(),
                excludeBots: participantsData.every(p => !p.isBot)
            }
        };
    }

    /**
     * Get historical rankings for each round
     */
    getHistoricalRankings(participantsData, roundRange, limit) {
        const maxRounds = Math.max(...participantsData.map(p => p.rounds.length));
        const startRound = roundRange?.from || 1;
        const endRound = roundRange?.to || maxRounds;

        const historicalData = [];

        for (let round = startRound; round <= endRound; round++) {
            const roundIndex = round - 1;
            
            // Calculate cumulative scores up to this round
            const roundRankings = participantsData
                .filter(p => p.rounds[roundIndex])
                .map(p => ({
                    userId: p.userId,
                    username: p.username,
                    firstName: p.firstName,
                    lastName: p.lastName,
                    cumulativeScore: _.sumBy(p.rounds.slice(0, round), 'score'),
                    roundScore: p.rounds[roundIndex].score,
                    medals: p.rounds[roundIndex].medals,
                    isBot: p.isBot
                }))
                .sort((a, b) => b.cumulativeScore - a.cumulativeScore)
                .slice(0, limit)
                .map((participant, index) => ({
                    ...participant,
                    position: index + 1
                }));

            historicalData.push({
                round,
                rankings: roundRankings,
                participants: roundRankings.length
            });
        }

        return {
            roundByRound: historicalData,
            summary: this.generateHistoricalSummary(historicalData)
        };
    }

    /**
     * Analyze ranking stability (how much positions change between rounds)
     */
    analyzeRankingStability(participantsData, limit) {
        const stabilityData = participantsData.map(participant => {
            const positions = participant.rounds
                .filter(r => r.positions)
                .map(r => r.positions.current);

            if (positions.length < 2) {
                return {
                    userId: participant.userId,
                    username: participant.username,
                    stability: 'insufficient_data',
                    averagePosition: positions[0] || 'N/A',
                    positionChanges: 0,
                    maxPosition: positions[0] || 'N/A',
                    minPosition: positions[0] || 'N/A'
                };
            }

            const positionChanges = [];
            for (let i = 1; i < positions.length; i++) {
                positionChanges.push(Math.abs(positions[i] - positions[i - 1]));
            }

            const avgPositionChange = _.mean(positionChanges);
            const maxPositionChange = Math.max(...positionChanges);
            const stability = this.categorizeStability(avgPositionChange, maxPositionChange);

            return {
                userId: participant.userId,
                username: participant.username,
                firstName: participant.firstName,
                lastName: participant.lastName,
                stability,
                averagePosition: _.mean(positions),
                averagePositionChange: avgPositionChange,
                maxPositionChange,
                positionChanges: positionChanges.length,
                bestPosition: Math.min(...positions),
                worstPosition: Math.max(...positions),
                positionRange: Math.max(...positions) - Math.min(...positions),
                currentPosition: _.last(positions),
                isBot: participant.isBot
            };
        });

        const sortedByStability = _.orderBy(stabilityData, ['averagePositionChange'], ['asc']);

        return {
            mostStable: sortedByStability.slice(0, limit),
            leastStable: sortedByStability.slice(-limit).reverse(),
            stabilityDistribution: this.calculateStabilityDistribution(stabilityData)
        };
    }

    /**
     * Analyze ranking trends over time
     */
    analyzeRankingTrends(participantsData, limit) {
        const trendData = participantsData.map(participant => {
            const positions = participant.rounds
                .filter(r => r.positions)
                .map((r, index) => ({ round: index + 1, position: r.positions.current }));

            if (positions.length < 3) {
                return {
                    userId: participant.userId,
                    username: participant.username,
                    trend: 'insufficient_data',
                    positions: positions
                };
            }

            const trend = this.calculateTrendDirection(positions);
            const momentum = this.calculateMomentum(positions);

            return {
                userId: participant.userId,
                username: participant.username,
                firstName: participant.firstName,
                lastName: participant.lastName,
                trend: trend.direction,
                trendStrength: trend.strength,
                momentum,
                startPosition: positions[0].position,
                currentPosition: _.last(positions).position,
                bestPosition: Math.min(...positions.map(p => p.position)),
                worstPosition: Math.max(...positions.map(p => p.position)),
                totalPositionChange: _.last(positions).position - positions[0].position,
                isBot: participant.isBot,
                positions: positions.slice(-5) // Last 5 positions for trend visualization
            };
        });

        return {
            risingStars: _.orderBy(
                trendData.filter(t => t.trend === 'improving'), 
                ['trendStrength'], 
                ['desc']
            ).slice(0, limit),
            fallingStars: _.orderBy(
                trendData.filter(t => t.trend === 'declining'), 
                ['trendStrength'], 
                ['desc']
            ).slice(0, limit),
            stablePerformers: trendData
                .filter(t => t.trend === 'stable')
                .slice(0, limit),
            trendSummary: this.generateTrendSummary(trendData)
        };
    }

    // Helper methods
    calculatePositionTrend(participant) {
        const positions = participant.rounds
            .filter(r => r.positions)
            .map(r => r.positions.current);

        if (positions.length < 3) return 'insufficient_data';

        const recentPositions = positions.slice(-3);
        const trend = recentPositions[0] - recentPositions[recentPositions.length - 1];

        if (trend > 2) return 'improving';
        if (trend < -2) return 'declining';
        return 'stable';
    }

    categorizeStability(avgChange, maxChange) {
        if (avgChange <= 1 && maxChange <= 3) return 'very_stable';
        if (avgChange <= 2 && maxChange <= 5) return 'stable';
        if (avgChange <= 4 && maxChange <= 8) return 'moderate';
        if (avgChange <= 6 && maxChange <= 12) return 'volatile';
        return 'very_volatile';
    }

    calculateTrendDirection(positions) {
        if (positions.length < 3) return { direction: 'insufficient_data', strength: 0 };

        // Use linear regression to determine trend
        const n = positions.length;
        const sumX = _.sum(positions.map((_, i) => i));
        const sumY = _.sum(positions.map(p => p.position));
        const sumXY = _.sum(positions.map((p, i) => i * p.position));
        const sumXX = _.sum(positions.map((_, i) => i * i));

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const strength = Math.abs(slope);

        let direction;
        if (slope < -0.5) direction = 'improving'; // Negative slope means improving position (lower numbers)
        else if (slope > 0.5) direction = 'declining';
        else direction = 'stable';

        return { direction, strength };
    }

    calculateMomentum(positions) {
        if (positions.length < 4) return 'insufficient_data';

        const recent = positions.slice(-3);
        const earlier = positions.slice(-6, -3);

        if (earlier.length === 0) return 'insufficient_data';

        const recentAvg = _.meanBy(recent, 'position');
        const earlierAvg = _.meanBy(earlier, 'position');
        const momentum = earlierAvg - recentAvg; // Positive means improving

        if (momentum > 2) return 'accelerating_up';
        if (momentum > 0.5) return 'moving_up';
        if (momentum < -2) return 'accelerating_down';
        if (momentum < -0.5) return 'moving_down';
        return 'steady';
    }

    generateHistoricalSummary(historicalData) {
        return {
            totalRounds: historicalData.length,
            averageParticipants: _.meanBy(historicalData, 'participants'),
            leadershipChanges: this.countLeadershipChanges(historicalData),
            mostConsistentLeader: this.findMostConsistentLeader(historicalData)
        };
    }

    countLeadershipChanges(historicalData) {
        let changes = 0;
        let currentLeader = null;

        historicalData.forEach(round => {
            if (round.rankings.length > 0) {
                const leader = round.rankings[0].userId;
                if (currentLeader && currentLeader !== leader) {
                    changes++;
                }
                currentLeader = leader;
            }
        });

        return changes;
    }

    findMostConsistentLeader(historicalData) {
        const leaderCounts = {};

        historicalData.forEach(round => {
            if (round.rankings.length > 0) {
                const leader = round.rankings[0];
                leaderCounts[leader.userId] = (leaderCounts[leader.userId] || 0) + 1;
            }
        });

        const mostConsistent = _.maxBy(Object.entries(leaderCounts), pair => pair[1]);
        return mostConsistent ? {
            userId: mostConsistent[0],
            roundsAsLeader: mostConsistent[1],
            percentage: (mostConsistent[1] / historicalData.length) * 100
        } : null;
    }

    calculateStabilityDistribution(stabilityData) {
        const distribution = _.groupBy(stabilityData, 'stability');
        return _.mapValues(distribution, group => ({
            count: group.length,
            percentage: (group.length / stabilityData.length) * 100
        }));
    }

    generateTrendSummary(trendData) {
        const trends = _.groupBy(trendData, 'trend');
        return {
            improving: trends.improving?.length || 0,
            declining: trends.declining?.length || 0,
            stable: trends.stable?.length || 0,
            insufficient_data: trends.insufficient_data?.length || 0,
            totalAnalyzed: trendData.length
        };
    }
}

module.exports = { RankingsTool };
