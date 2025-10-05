/**
 * Statistics Tool
 * 
 * Provides general statistical insights and analysis about the betting pool
 */

const { BaseAnalyticsTool } = require('./BaseAnalyticsTool');
const _ = require('lodash');

class StatisticsTool extends BaseAnalyticsTool {
    constructor() {
        super(
            'statistics',
            `Provides comprehensive statistical analysis of betting pools. Can answer questions like:
            - What are the general pool statistics?
            - How are scores distributed?
            - What's the medal distribution?
            - Which rounds were most competitive?
            - What are betting patterns?
            - Performance trends over time?
            
            Input should be a JSON object with:
            - poolId (required): The pool ID to analyze
            - analysisType (optional): 'overview', 'distribution', 'trends', 'rounds', 'medals'
            - includeRounds (optional): Array of specific rounds to analyze
            - excludeBots (optional): Whether to exclude bots from analysis (default: false)`
        );
    }

    async _call(input) {
        try {
            const params = typeof input === 'string' ? JSON.parse(input) : input;
            const { 
                poolId, 
                analysisType = 'overview',
                includeRounds,
                excludeBots = false
            } = params;

            if (!poolId) {
                throw new Error('poolId is required');
            }

            const participantsData = await this.getPoolParticipantsData(poolId);
            let filteredData = excludeBots ? 
                participantsData.filter(p => !p.isBot) : 
                participantsData;

            const results = {};

            switch (analysisType) {
                case 'overview':
                    results.overview = this.generateOverviewStats(filteredData);
                    break;
                case 'distribution':
                    results.distribution = this.generateDistributionStats(filteredData);
                    break;
                case 'trends':
                    results.trends = this.generateTrendStats(filteredData);
                    break;
                case 'rounds':
                    results.rounds = this.generateRoundStats(filteredData, includeRounds);
                    break;
                case 'medals':
                    results.medals = this.generateMedalStats(filteredData);
                    break;
                default:
                    // Generate all statistics
                    results.overview = this.generateOverviewStats(filteredData);
                    results.distribution = this.generateDistributionStats(filteredData);
                    results.trends = this.generateTrendStats(filteredData);
                    results.rounds = this.generateRoundStats(filteredData, includeRounds);
                    results.medals = this.generateMedalStats(filteredData);
            }

            return this.formatResponse(results, `Statistical analysis for pool ${poolId}`);

        } catch (error) {
            return this.formatResponse({ 
                error: error.message,
                tool: 'StatisticsTool'
            }, 'Error occurred during statistical analysis');
        }
    }

    /**
     * Generate overview statistics
     */
    generateOverviewStats(participantsData) {
        const totalScores = participantsData.map(p => p.score);
        const totalRounds = Math.max(...participantsData.map(p => p.rounds.length));

        return {
            participants: {
                total: participantsData.length,
                bots: participantsData.filter(p => p.isBot).length,
                humans: participantsData.filter(p => !p.isBot).length
            },
            scores: {
                highest: Math.max(...totalScores),
                lowest: Math.min(...totalScores),
                average: _.mean(totalScores),
                median: this.calculateMedian(totalScores),
                standardDeviation: this.calculateStandardDeviation(totalScores),
                total: _.sum(totalScores)
            },
            rounds: {
                total: totalRounds,
                averageParticipation: _.mean(participantsData.map(p => p.rounds.length))
            },
            competition: {
                scoreSpread: Math.max(...totalScores) - Math.min(...totalScores),
                competitivenessIndex: this.calculateCompetitivenessIndex(participantsData)
            }
        };
    }

    /**
     * Generate score distribution statistics
     */
    generateDistributionStats(participantsData) {
        const scores = participantsData.map(p => p.score);
        const quartiles = this.calculateQuartiles(scores);

        return {
            quartiles,
            percentiles: {
                p10: this.calculatePercentile(scores, 10),
                p25: quartiles.q1,
                p50: quartiles.q2,
                p75: quartiles.q3,
                p90: this.calculatePercentile(scores, 90),
                p95: this.calculatePercentile(scores, 95)
            },
            distribution: {
                skewness: this.calculateSkewness(scores),
                kurtosis: this.calculateKurtosis(scores)
            },
            scoreRanges: this.analyzeScoreRanges(scores)
        };
    }

    /**
     * Generate trend statistics over rounds
     */
    generateTrendStats(participantsData) {
        const maxRounds = Math.max(...participantsData.map(p => p.rounds.length));
        const roundTrends = [];

        for (let round = 0; round < maxRounds; round++) {
            const roundData = participantsData
                .filter(p => p.rounds[round])
                .map(p => ({
                    userId: p.userId,
                    score: p.rounds[round].score,
                    cumulativeScore: _.sumBy(p.rounds.slice(0, round + 1), 'score')
                }));

            if (roundData.length > 0) {
                roundTrends.push({
                    round: round + 1,
                    participants: roundData.length,
                    averageRoundScore: _.meanBy(roundData, 'score'),
                    averageCumulativeScore: _.meanBy(roundData, 'cumulativeScore'),
                    highestRoundScore: _.maxBy(roundData, 'score')?.score || 0,
                    lowestRoundScore: _.minBy(roundData, 'score')?.score || 0,
                    scoreVariance: this.calculateVariance(roundData.map(d => d.score))
                });
            }
        }

        return {
            roundByRound: roundTrends,
            trends: {
                scoringTrend: this.calculateScoringTrend(roundTrends),
                participationTrend: this.calculateParticipationTrend(roundTrends),
                competitionTrend: this.calculateCompetitionTrend(roundTrends)
            }
        };
    }

    /**
     * Generate round-specific statistics
     */
    generateRoundStats(participantsData, includeRounds) {
        const maxRounds = Math.max(...participantsData.map(p => p.rounds.length));
        const roundsToAnalyze = includeRounds || _.range(1, maxRounds + 1);

        return roundsToAnalyze.map(roundNum => {
            const roundIndex = roundNum - 1;
            const roundParticipants = participantsData
                .filter(p => p.rounds[roundIndex])
                .map(p => p.rounds[roundIndex]);

            const scores = roundParticipants.map(r => r.score);
            const medals = roundParticipants.map(r => r.medals);

            return {
                round: roundNum,
                participants: roundParticipants.length,
                scores: {
                    average: _.mean(scores),
                    highest: Math.max(...scores),
                    lowest: Math.min(...scores),
                    median: this.calculateMedian(scores)
                },
                medals: {
                    gold: _.sumBy(medals, m => m['3'] || 0),
                    silver: _.sumBy(medals, m => m['2'] || 0),
                    bronze: _.sumBy(medals, m => m['1'] || 0)
                },
                bets: {
                    total: _.sumBy(roundParticipants, r => r.bets.length),
                    average: _.meanBy(roundParticipants, r => r.bets.length)
                },
                difficulty: this.calculateRoundDifficulty(roundParticipants)
            };
        });
    }

    /**
     * Generate medal statistics
     */
    generateMedalStats(participantsData) {
        const allMedals = participantsData.map(p => p.medals);
        
        return {
            totalMedals: {
                gold: _.sumBy(allMedals, m => m['3'] || 0),
                silver: _.sumBy(allMedals, m => m['2'] || 0),
                bronze: _.sumBy(allMedals, m => m['1'] || 0)
            },
            averageMedals: {
                gold: _.meanBy(allMedals, m => m['3'] || 0),
                silver: _.meanBy(allMedals, m => m['2'] || 0),
                bronze: _.meanBy(allMedals, m => m['1'] || 0)
            },
            medalLeaders: {
                goldLeader: _.maxBy(participantsData, p => p.medals['3'] || 0),
                silverLeader: _.maxBy(participantsData, p => p.medals['2'] || 0),
                bronzeLeader: _.maxBy(participantsData, p => p.medals['1'] || 0),
                totalMedalLeader: _.maxBy(participantsData, p => 
                    (p.medals['3'] || 0) + (p.medals['2'] || 0) + (p.medals['1'] || 0)
                )
            },
            medalEfficiency: participantsData.map(p => ({
                userId: p.userId,
                username: p.username,
                totalMedals: (p.medals['3'] || 0) + (p.medals['2'] || 0) + (p.medals['1'] || 0),
                medalScore: (p.medals['3'] || 0) * 3 + (p.medals['2'] || 0) * 2 + (p.medals['1'] || 0),
                efficiency: p.score > 0 ? ((p.medals['3'] || 0) * 3 + (p.medals['2'] || 0) * 2 + (p.medals['1'] || 0)) / p.score : 0
            })).sort((a, b) => b.efficiency - a.efficiency)
        };
    }

    // Helper statistical functions
    calculateMedian(values) {
        const sorted = values.slice().sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    calculateQuartiles(values) {
        const sorted = values.slice().sort((a, b) => a - b);
        const n = sorted.length;
        return {
            q1: this.calculatePercentile(sorted, 25),
            q2: this.calculatePercentile(sorted, 50),
            q3: this.calculatePercentile(sorted, 75)
        };
    }

    calculatePercentile(sortedValues, percentile) {
        const index = (percentile / 100) * (sortedValues.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index % 1;
        
        if (upper >= sortedValues.length) return sortedValues[sortedValues.length - 1];
        return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
    }

    calculateStandardDeviation(values) {
        const mean = _.mean(values);
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        return Math.sqrt(_.mean(squaredDiffs));
    }

    calculateVariance(values) {
        const mean = _.mean(values);
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        return _.mean(squaredDiffs);
    }

    calculateSkewness(values) {
        const mean = _.mean(values);
        const std = this.calculateStandardDeviation(values);
        const n = values.length;
        const skewness = values.reduce((sum, value) => sum + Math.pow((value - mean) / std, 3), 0) / n;
        return skewness;
    }

    calculateKurtosis(values) {
        const mean = _.mean(values);
        const std = this.calculateStandardDeviation(values);
        const n = values.length;
        const kurtosis = values.reduce((sum, value) => sum + Math.pow((value - mean) / std, 4), 0) / n - 3;
        return kurtosis;
    }

    calculateCompetitivenessIndex(participantsData) {
        const scores = participantsData.map(p => p.score);
        const mean = _.mean(scores);
        const std = this.calculateStandardDeviation(scores);
        return std / mean; // Coefficient of variation
    }

    analyzeScoreRanges(scores) {
        const min = Math.min(...scores);
        const max = Math.max(...scores);
        const range = max - min;
        const binSize = range / 5;

        const ranges = [];
        for (let i = 0; i < 5; i++) {
            const start = min + i * binSize;
            const end = min + (i + 1) * binSize;
            const count = scores.filter(s => s >= start && (i === 4 ? s <= end : s < end)).length;
            ranges.push({
                range: `${Math.round(start)}-${Math.round(end)}`,
                count,
                percentage: (count / scores.length) * 100
            });
        }

        return ranges;
    }

    calculateScoringTrend(roundTrends) {
        if (roundTrends.length < 2) return 'insufficient_data';
        
        const firstHalf = roundTrends.slice(0, Math.floor(roundTrends.length / 2));
        const secondHalf = roundTrends.slice(Math.floor(roundTrends.length / 2));
        
        const firstAvg = _.meanBy(firstHalf, 'averageRoundScore');
        const secondAvg = _.meanBy(secondHalf, 'averageRoundScore');
        
        if (secondAvg > firstAvg * 1.1) return 'increasing';
        if (secondAvg < firstAvg * 0.9) return 'decreasing';
        return 'stable';
    }

    calculateParticipationTrend(roundTrends) {
        if (roundTrends.length < 2) return 'insufficient_data';
        
        const firstParticipation = roundTrends[0].participants;
        const lastParticipation = roundTrends[roundTrends.length - 1].participants;
        
        if (lastParticipation > firstParticipation * 1.1) return 'increasing';
        if (lastParticipation < firstParticipation * 0.9) return 'decreasing';
        return 'stable';
    }

    calculateCompetitionTrend(roundTrends) {
        if (roundTrends.length < 2) return 'insufficient_data';
        
        const variances = roundTrends.map(r => r.scoreVariance);
        const firstHalf = variances.slice(0, Math.floor(variances.length / 2));
        const secondHalf = variances.slice(Math.floor(variances.length / 2));
        
        const firstAvg = _.mean(firstHalf);
        const secondAvg = _.mean(secondHalf);
        
        if (secondAvg > firstAvg * 1.1) return 'more_competitive';
        if (secondAvg < firstAvg * 0.9) return 'less_competitive';
        return 'stable';
    }

    calculateRoundDifficulty(roundParticipants) {
        const scores = roundParticipants.map(r => r.score);
        const avgScore = _.mean(scores);
        const maxPossibleScore = Math.max(...scores) || 1;
        
        return {
            difficulty: 1 - (avgScore / maxPossibleScore),
            scoreSpread: Math.max(...scores) - Math.min(...scores),
            participantSuccess: scores.filter(s => s > 0).length / scores.length
        };
    }
}

module.exports = { StatisticsTool };
