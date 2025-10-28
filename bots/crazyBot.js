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
const { ChatOpenAI } = require('langchain/chat_models/openai');
const { HumanMessage, SystemMessage } = require('langchain/schema');

class CrazyBot extends Bot {
    constructor() {
        super(4, 'crazyBot'); // Assuming ID 4 for crazy bot
        this.llm = new ChatOpenAI({
            modelName: 'gpt-4',
            temperature: 0.3,
            maxTokens: 500
        });
    }

    /**
     * Crazy Bot Learning Data:
     * Uses AI to analyze games and provide predictions
     */
    async learningData(challenges, {transaction} = {}) {
        try {
            const learningData = {};
            
            for (const challenge of challenges) {
                const game = challenge.game;
                if (!game) continue;
                
                // Get basic game information
                const gameInfo = await this.getGameInfo(game, {transaction});
                
                // Ask AI for prediction
                const aiPrediction = await this.askAIForPrediction({
                    gameInfo,
                    odds1: challenge.odds1,
                    odds2: challenge.odds2,
                    playAt: challenge.playAt
                });
                
                learningData[challenge.id] = {
                    gameInfo,
                    aiPrediction,
                    confidence: aiPrediction.confidence
                };
            }
            
            return learningData;
        } catch (error) {
            console.error('CrazyBot learningData error:', error);
            return {};
        }
    }

    /**
     * Get basic game information for AI analysis
     */
    async getGameInfo(game, {transaction} = {}) {
        try {
            // Get team names (assuming you have team models)
            const homeTeam = await game.getHomeTeam({transaction});
            const awayTeam = await game.getAwayTeam({transaction});
            
            return {
                homeTeamName: homeTeam?.name || 'Home Team',
                awayTeamName: awayTeam?.name || 'Away Team',
                homeTeamId: game.homeTeamId,
                awayTeamId: game.awayTeamId,
                playAt: game.playAt,
                eventId: game.eventId,
                round: game.round
            };
        } catch (error) {
            console.error('Error getting game info:', error);
            return {
                homeTeamName: 'Home Team',
                awayTeamName: 'Away Team',
                homeTeamId: game.homeTeamId,
                awayTeamId: game.awayTeamId,
                playAt: game.playAt,
                eventId: game.eventId,
                round: game.round
            };
        }
    }

    /**
     * Ask AI for prediction using LangChain
     */
    async askAIForPrediction({gameInfo, odds1, odds2, playAt}) {
        try {
            const systemMessage = new SystemMessage(`
You are an expert football analyst with access to comprehensive data about teams, players, form, injuries, and match history. 

Your task is to predict the exact final score of a football match based on all available information.

Consider these factors in your analysis:
- Current team form and recent performances
- Head-to-head history between the teams
- Team lineups and player availability
- Injuries and suspensions
- Current league position and points
- Home/away advantage
- Weather conditions (if relevant)
- Team motivation and stakes
- Betting odds and market expectations

Provide your prediction in this exact format:
HOME_SCORE:AWAY_SCORE:CONFIDENCE

Where:
- HOME_SCORE: Predicted goals for home team (0-5)
- AWAY_SCORE: Predicted goals for away team (0-5)  
- CONFIDENCE: Your confidence level (0.1-1.0)

Example: 2:1:0.8
`);

            const humanMessage = new HumanMessage(`
Analyze this football match and provide a score prediction:

MATCH: ${gameInfo.homeTeamName} vs ${gameInfo.awayTeamName}
DATE: ${moment(playAt).format('YYYY-MM-DD HH:mm')}
ROUND: ${gameInfo.round}
BETTING ODDS: Home ${odds1} | Away ${odds2}

Please provide your prediction in the format: HOME_SCORE:AWAY_SCORE:CONFIDENCE
`);

            const response = await this.llm.call([systemMessage, humanMessage]);
            const prediction = this.parseAIPrediction(response.content);
            
            return prediction;
        } catch (error) {
            console.error('Error asking AI for prediction:', error);
            // Fallback to basic odds-based prediction
            return {
                score1: odds1 < 2 ? 3 : 1,
                score2: odds2 < 2 ? 3 : 1,
                confidence: 0.3,
                strategy: 'fallback'
            };
        }
    }

    /**
     * Parse AI prediction response
     */
    parseAIPrediction(response) {
        try {
            // Look for pattern HOME_SCORE:AWAY_SCORE:CONFIDENCE
            const match = response.match(/(\d+):(\d+):([\d.]+)/);
            
            if (match) {
                const score1 = Math.max(0, Math.min(5, parseInt(match[1])));
                const score2 = Math.max(0, Math.min(5, parseInt(match[2])));
                const confidence = Math.max(0.1, Math.min(1.0, parseFloat(match[3])));
                
                return {
                    score1,
                    score2,
                    confidence,
                    strategy: 'ai-analysis',
                    rawResponse: response
                };
            }
            
            // Fallback parsing
            const numbers = response.match(/\d+/g);
            if (numbers && numbers.length >= 2) {
                return {
                    score1: Math.max(0, Math.min(5, parseInt(numbers[0]))),
                    score2: Math.max(0, Math.min(5, parseInt(numbers[1]))),
                    confidence: 0.5,
                    strategy: 'ai-analysis-fallback',
                    rawResponse: response
                };
            }
            
            throw new Error('Could not parse AI response');
        } catch (error) {
            console.error('Error parsing AI prediction:', error);
            return {
                score1: 1,
                score2: 1,
                confidence: 0.3,
                strategy: 'parse-error',
                rawResponse: response
            };
        }
    }

    /**
     * Crazy Bot Betting Strategy:
     * Uses AI analysis to make predictions
     */
    setBet({openChallenge = [], learningData = {}}) {
        return _.map(openChallenge, (challenge) => {
            const data = learningData[challenge.id] || {};
            
            if (data.aiPrediction) {
                return {
                    challengeId: challenge.id,
                    userId: this.id,
                    score1: data.aiPrediction.score1,
                    score2: data.aiPrediction.score2,
                    confidence: data.aiPrediction.confidence,
                    strategy: data.aiPrediction.strategy,
                    rawResponse: data.aiPrediction.rawResponse
                };
            }
            
            // Fallback to basic odds-based prediction
            const score1 = challenge.odds1 < 2 ? 3 : 1;
            const score2 = challenge.odds2 < 2 ? 3 : 1;
            
            return {
                challengeId: challenge.id,
                userId: this.id,
                score1,
                score2,
                confidence: 0.3,
                strategy: 'fallback'
            };
        });
    }
}

module.exports = CrazyBot;