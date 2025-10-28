'use strict';
const _ = require('lodash');
const { Sequelize} = require('../models');
const {Op} = Sequelize;
const Bot = require('./bot');

const betRepository = require("../repositories/betRepository");

class CrowdBot extends Bot{
    constructor() {
        super(4, 'crowdBot', true);
    }
    async learningData(openChallenge, {transaction}) {
        const challengeIds = _.map(openChallenge, 'id');
        const otherBets = await betRepository.findUserBetsByQuery({
            challengeId: {[Op.in]: challengeIds},
            userId: {[Op.notIn]: this.id}
        },{transaction});
        
        // Enhanced crowd analysis with mathematical models
        const crowdAnalysis = this.analyzeCrowdBetting(otherBets, challengeIds);
        
        return {
            otherBets: this.removeAnomalies(otherBets),
            crowdAnalysis
        };
    }
    setBet({openChallenge = [], learningData}) {
        const otherBets = _.get(learningData, 'otherBets', []);
        const crowdAnalysis = _.get(learningData, 'crowdAnalysis', {});
        
        return _.map(openChallenge, (challenge) => {
            const challengeBets = _.filter(otherBets, {challengeId: challenge.id});
            const analysis = crowdAnalysis[challenge.id];
            
            if (_.isEmpty(challengeBets) || !analysis) {
                return this.defaultBet(challenge);
            }
            
            // Use sophisticated crowd analysis
            const prediction = this.calculateCrowdPrediction(challengeBets, analysis, challenge);
            
            return {
                challengeId: challenge.id, 
                userId: this.id,
                score1: prediction.score1, 
                score2: prediction.score2,
                confidence: prediction.confidence,
                strategy: prediction.strategy,
                isPublic: true
            };
        });
    }

    /**
     * Analyze crowd betting patterns with mathematical models
     */
    analyzeCrowdBetting(bets, challengeIds) {
        const analysis = {};
        
        challengeIds.forEach(challengeId => {
            const challengeBets = _.filter(bets, {challengeId});
            
            if (challengeBets.length === 0) {
                analysis[challengeId] = null;
                return;
            }
            
            const scores1 = _.map(challengeBets, 'score1');
            const scores2 = _.map(challengeBets, 'score2');
            
            // Basic statistics
            const mean1 = _.mean(scores1);
            const mean2 = _.mean(scores2);
            const median1 = this.median(scores1);
            const median2 = this.median(scores2);
            const std1 = this.standardDeviation(scores1);
            const std2 = this.standardDeviation(scores2);
            
            // Weighted analysis (more recent bets get higher weight)
            const weightedPrediction = this.calculateWeightedPrediction(challengeBets);
            
            // Consensus analysis
            const consensus = this.analyzeConsensus(challengeBets);
            
            // Wisdom of crowds analysis
            const wisdomScore = this.calculateWisdomScore(challengeBets);
            
            analysis[challengeId] = {
                totalBets: challengeBets.length,
                mean1, mean2,
                median1, median2,
                std1, std2,
                weightedPrediction,
                consensus,
                wisdomScore,
                confidence: this.calculateConfidence(challengeBets, consensus, wisdomScore)
            };
        });
        
        return analysis;
    }

    /**
     * Calculate weighted prediction (recent bets matter more)
     */
    calculateWeightedPrediction(bets) {
        const now = new Date();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        
        let totalWeight = 0;
        let weightedScore1 = 0;
        let weightedScore2 = 0;
        
        bets.forEach(bet => {
            // Weight based on recency (if we have timestamp data)
            const age = bet.createdAt ? (now - new Date(bet.createdAt)) : 0;
            const weight = Math.max(0.1, 1 - (age / maxAge));
            
            totalWeight += weight;
            weightedScore1 += bet.score1 * weight;
            weightedScore2 += bet.score2 * weight;
        });
        
        return {
            score1: totalWeight > 0 ? weightedScore1 / totalWeight : _.mean(_.map(bets, 'score1')),
            score2: totalWeight > 0 ? weightedScore2 / totalWeight : _.mean(_.map(bets, 'score2'))
        };
    }

    /**
     * Analyze consensus among bettors
     */
    analyzeConsensus(bets) {
        const scores1 = _.map(bets, 'score1');
        const scores2 = _.map(bets, 'score2');
        
        // Find most common scores
        const mode1 = this.mode(scores1);
        const mode2 = this.mode(scores2);
        
        // Calculate agreement percentage
        const agreement1 = scores1.filter(s => s === mode1).length / scores1.length;
        const agreement2 = scores2.filter(s => s === mode2).length / scores2.length;
        
        return {
            mode1, mode2,
            agreement1, agreement2,
            overallAgreement: (agreement1 + agreement2) / 2
        };
    }

    /**
     * Calculate wisdom of crowds score
     */
    calculateWisdomScore(bets) {
        const scores1 = _.map(bets, 'score1');
        const scores2 = _.map(bets, 'score2');
        
        // Diversity of predictions (higher diversity = higher wisdom potential)
        const diversity1 = this.calculateDiversity(scores1);
        const diversity2 = this.calculateDiversity(scores2);
        
        // Independence (avoid groupthink)
        const independence = this.calculateIndependence(bets);
        
        // Decentralization (different perspectives)
        const decentralization = this.calculateDecentralization(bets);
        
        return {
            diversity1, diversity2,
            independence,
            decentralization,
            overallWisdom: (diversity1 + diversity2 + independence + decentralization) / 4
        };
    }

    /**
     * Calculate final crowd prediction
     */
    calculateCrowdPrediction(bets, analysis, challenge) {
        const { mean1, mean2, median1, median2, weightedPrediction, consensus, wisdomScore } = analysis;
        
        // Strategy selection based on crowd characteristics
        let strategy, score1, score2, confidence;
        
        if (consensus.overallAgreement > 0.6) {
            // High consensus - use mode
            strategy = 'consensus';
            score1 = consensus.mode1;
            score2 = consensus.mode2;
            confidence = consensus.overallAgreement;
        } else if (wisdomScore.overallWisdom > 0.7) {
            // High wisdom - use weighted average
            strategy = 'wisdom-weighted';
            score1 = Math.round(weightedPrediction.score1);
            score2 = Math.round(weightedPrediction.score2);
            confidence = wisdomScore.overallWisdom;
        } else if (bets.length > 10) {
            // Large crowd - use median (robust to outliers)
            strategy = 'median';
            score1 = median1;
            score2 = median2;
            confidence = Math.min(0.8, bets.length / 20);
        } else {
            // Small crowd - use mean
            strategy = 'mean';
            score1 = Math.round(mean1);
            score2 = Math.round(mean2);
            confidence = Math.min(0.6, bets.length / 10);
        }
        
        // Apply bounds and validation
        score1 = Math.max(0, Math.min(5, score1));
        score2 = Math.max(0, Math.min(5, score2));
        
        return {
            score1,
            score2,
            confidence: Math.max(0.1, Math.min(1.0, confidence)),
            strategy
        };
    }

    // Mathematical helper functions
    median(arr) {
        const sorted = arr.slice().sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    standardDeviation(arr) {
        const mean = _.mean(arr);
        const variance = _.mean(arr.map(x => Math.pow(x - mean, 2)));
        return Math.sqrt(variance);
    }

    mode(arr) {
        const frequency = {};
        arr.forEach(x => frequency[x] = (frequency[x] || 0) + 1);
        return parseInt(_.maxBy(_.keys(frequency), k => frequency[k]));
    }

    calculateDiversity(arr) {
        const unique = _.uniq(arr).length;
        return unique / Math.min(arr.length, 6); // Max diversity is 6 unique values (0-5)
    }

    calculateIndependence(bets) {
        // Simple independence measure based on score distribution
        const scores1 = _.map(bets, 'score1');
        const scores2 = _.map(bets, 'score2');
        
        const entropy1 = this.calculateEntropy(scores1);
        const entropy2 = this.calculateEntropy(scores2);
        
        return (entropy1 + entropy2) / 2;
    }

    calculateDecentralization(bets) {
        // Measure how spread out the predictions are
        const scores1 = _.map(bets, 'score1');
        const scores2 = _.map(bets, 'score2');
        
        const range1 = _.max(scores1) - _.min(scores1);
        const range2 = _.max(scores2) - _.min(scores2);
        
        return (range1 + range2) / 10; // Normalize to 0-1
    }

    calculateEntropy(arr) {
        const frequency = {};
        arr.forEach(x => frequency[x] = (frequency[x] || 0) + 1);
        
        let entropy = 0;
        const total = arr.length;
        
        _.values(frequency).forEach(count => {
            const p = count / total;
            if (p > 0) entropy -= p * Math.log2(p);
        });
        
        return entropy;
    }

    calculateConfidence(bets, consensus, wisdomScore) {
        const baseConfidence = Math.min(0.9, bets.length / 15);
        const consensusBonus = consensus.overallAgreement * 0.3;
        const wisdomBonus = wisdomScore.overallWisdom * 0.2;
        
        return Math.min(1.0, baseConfidence + consensusBonus + wisdomBonus);
    }

}

// CrowdBot.prototype.bet = function (challengeModel) {
//     if (!this.userId) return;
//     return repository.findByChallengeId(challengeModel._id)
//         .then((bets = []) => {
//             const myBet = _.find(bets,{participate: this.userId});
//             if (myBet) return myBet;
//             const score1Avg = _.sumBy(bets, 'score1') / _.size(bets) ;
//             const score2Avg = _.sumBy(bets, 'score2') / _.size(bets);
//             const score1 = _.isNaN(score1Avg) ? 0 : _.round(score1Avg);
//             const score2 = _.isNaN(score1Avg)? 0 : _.round(score2Avg);
//             return {challenge: challengeModel._id, pool: mongoose.Types.ObjectId('55cdcdc780d1afee6c4d5fdb'), participate: this.userId, score1, score2, public: true};
//         }).then((bet) => {
//             if (_.isPlainObject(bet)){
//                 return repository.createOrUpdate(bet);
//             }
//             return bet;
//         })
// };
//
// util.inherits(CrowdBot, Bot);

module.exports = CrowdBot;

