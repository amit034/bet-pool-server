'use strict';
const _ = require('lodash');
const moment = require('moment');
const { Sequelize, sequelize} = require('../models');
const {Op} = Sequelize;
const Bot = require('./bot');
const gameRepository = require('../repositories/gameRepository');
const challengeRepository = require('../repositories/challengeRepository');
const poolRepository = require('../repositories/poolRepository');
const repository = require('../repositories/betRepository');

class SmartBot extends Bot {
    constructor() {
        super(3, 'smartBot'); // Assuming ID 3 for smart bot
    }

    /**
     * Smart Bot Learning Data:
     * Analyzes historical games with similar odds to predict scores
     */
    async learningData(challenges, {transaction} = {}) {
        try {
            const learningData = {};
            
            for (const challenge of challenges) {
                const odds1 = challenge.odds1;
                const odds2 = challenge.odds2;
                
                // Find historical games with similar odds (within 0.5 range)
                const similarGames = await gameRepository.findGamesByQuery({
                    playAt: {[Op.lt]: moment()}, // Past games only
                    score1: {[Op.ne]: null},
                    score2: {[Op.ne]: null}
                }, {
                    include: [{
                        model: require('../models').Challenge,
                        as: 'challenges',
                        where: {
                            odds1: {[Op.between]: [odds1 - 0.5, odds1 + 0.5]},
                            odds2: {[Op.between]: [odds2 - 0.5, odds2 + 0.5]}
                        }
                    }],
                    transaction
                });

                // Calculate average scores from similar historical games
                const scores = similarGames.map(game => ({
                    score1: game.score1,
                    score2: game.score2
                }));

                if (scores.length > 0) {
                    const avgScore1 = _.meanBy(scores, 'score1');
                    const avgScore2 = _.meanBy(scores, 'score2');
                    
                    learningData[challenge.id] = {
                        historicalGames: scores.length,
                        avgScore1: Math.round(avgScore1),
                        avgScore2: Math.round(avgScore2),
                        confidence: Math.min(scores.length / 10, 1) // Confidence based on sample size
                    };
                } else {
                    // Fallback to odds-based prediction if no historical data
                    learningData[challenge.id] = {
                        historicalGames: 0,
                        avgScore1: odds1 < 2 ? 3 : 1,
                        avgScore2: odds2 < 2 ? 3 : 1,
                        confidence: 0.3
                    };
                }
            }
            
            return learningData;
        } catch (error) {
            console.error('SmartBot learningData error:', error);
            return {};
        }
    }

    /**
     * Smart Bot Betting Strategy:
     * Uses historical data and odds analysis to make intelligent predictions
     */
    setBet({openChallenge = [], learningData = {}}) {
        return _.map(openChallenge, (challenge) => {
            const data = learningData[challenge.id] || {};
            
            // Use historical data if available and confident
            if (data.historicalGames > 0 && data.confidence > 0.5) {
                return {
                    challengeId: challenge.id,
                    userId: this.id,
                    score1: data.avgScore1,
                    score2: data.avgScore2,
                    confidence: data.confidence,
                    strategy: 'historical'
                };
            }
            
            // Fallback to odds-based prediction
            const score1 = challenge.odds1 < 2 ? 3 : 1;
            const score2 = challenge.odds2 < 2 ? 3 : 1;
            
            return {
                challengeId: challenge.id,
                userId: this.id,
                score1,
                score2,
                confidence: 0.3,
                strategy: 'odds-based'
            };
        });
    }
}

module.exports = SmartBot;