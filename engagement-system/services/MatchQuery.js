'use strict';

const db = require('../../models');
const { Op } = require('sequelize');
const logger = require('../../utils/logger');

/**
 * MatchQuery - Game and match-related query class using existing database models
 * Provides data access for games, challenges, and match-related insights
 */
class MatchQuery {
    /**
     * Get today's matches
     * @param {number} poolId - Pool ID to filter by
     * @returns {Promise<Array>} Array of today's matches
     */
    static async getTodayMatches(poolId = null) {
        try {
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            
            // Query your existing Game model
            const whereClause = {
                playAt: {
                    [Op.between]: [startOfDay, endOfDay]
                },
                status: {
                    [Op.ne]: 'FINISHED'
                }
            };
            
            if (poolId) {
                // Add pool-specific filtering if needed
                // This would involve joining with pool-related tables
            }
            
            // Example query with your existing models:
            // const matches = await db.Game.findAll({
            //     where: whereClause,
            //     include: [
            //         { model: db.Team, as: 'homeTeam' },
            //         { model: db.Team, as: 'awayTeam' },
            //         { model: db.Event }
            //     ],
            //     order: [['playAt', 'ASC']]
            // });
            
            const matches = [];
            
            logger.debug(`MatchQuery: Found ${matches.length} matches for today`);
            return matches;
        } catch (error) {
            logger.error('MatchQuery: Error getting today matches:', error);
            return [];
        }
    }

    /**
     * Get live matches
     * @param {number} poolId - Pool ID to filter by
     * @returns {Promise<Array>} Array of live matches
     */
    static async getLiveMatches(poolId = null) {
        try {
            const liveMatches = [];
            
            // Query matches with LIVE status
            // This would use your existing Game model
            // const matches = await db.Game.findAll({
            //     where: { status: 'LIVE' },
            //     include: [
            //         { model: db.Team, as: 'homeTeam' },
            //         { model: db.Team, as: 'awayTeam' }
            //     ]
            // });
            
            logger.debug(`MatchQuery: Found ${liveMatches.length} live matches`);
            return liveMatches;
        } catch (error) {
            logger.error('MatchQuery: Error getting live matches:', error);
            return [];
        }
    }

    /**
     * Get upcoming matches
     * @param {number} poolId - Pool ID to filter by
     * @param {number} hours - Hours ahead to look
     * @returns {Promise<Array>} Array of upcoming matches
     */
    static async getUpcomingMatches(poolId = null, hours = 24) {
        try {
            const now = new Date();
            const future = new Date(now.getTime() + (hours * 60 * 60 * 1000));
            
            const upcomingMatches = [];
            
            // Query matches starting within the specified time frame
            // This would use your existing Game model
            
            logger.debug(`MatchQuery: Found ${upcomingMatches.length} upcoming matches`);
            return upcomingMatches;
        } catch (error) {
            logger.error('MatchQuery: Error getting upcoming matches:', error);
            return [];
        }
    }

    /**
     * Get matches by team
     * @param {number} teamId - Team ID
     * @param {number} days - Number of days to look back/forward
     * @returns {Promise<Array>} Array of team matches
     */
    static async getTeamMatches(teamId, days = 7) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + days);
            
            const teamMatches = [];
            
            // Query matches for specific team
            // This would use your existing Game model with team filtering
            
            logger.debug(`MatchQuery: Found ${teamMatches.length} matches for team ${teamId}`);
            return teamMatches;
        } catch (error) {
            logger.error('MatchQuery: Error getting team matches:', error);
            return [];
        }
    }

    /**
     * Get challenges for a match
     * @param {number} gameId - Game ID
     * @returns {Promise<Array>} Array of challenges for the match
     */
    static async getMatchChallenges(gameId) {
        try {
            const challenges = [];
            
            // Query challenges related to a specific game
            // This would use your existing Challenge model
            // const challenges = await db.Challenge.findAll({
            //     where: { refId: gameId, refName: 'Game' },
            //     include: [{ model: db.Game }]
            // });
            
            logger.debug(`MatchQuery: Found ${challenges.length} challenges for game ${gameId}`);
            return challenges;
        } catch (error) {
            logger.error('MatchQuery: Error getting match challenges:', error);
            return [];
        }
    }

    /**
     * Get team statistics
     * @param {number} teamId - Team ID
     * @param {number} days - Number of days to analyze
     * @returns {Promise<Object>} Team statistics
     */
    static async getTeamStats(teamId, days = 30) {
        try {
            const stats = {
                teamId,
                period: `${days} days`,
                matchesPlayed: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goalsScored: 0,
                goalsConceded: 0,
                averageGoals: 0,
                winRate: 0,
                form: [] // Last 5 matches results
            };
            
            // Calculate team statistics from recent matches
            // This would use your existing Game model
            
            logger.debug(`MatchQuery: Got stats for team ${teamId}`);
            return stats;
        } catch (error) {
            logger.error('MatchQuery: Error getting team stats:', error);
            return null;
        }
    }

    /**
     * Get matches with specific conditions
     * @param {Object} conditions - Match conditions
     * @returns {Promise<Array>} Array of matches matching conditions
     */
    static async getMatchesByConditions(conditions) {
        try {
            const matches = [];
            
            // Query matches based on specific conditions
            // This would use your existing Game model with complex where clauses
            
            logger.debug(`MatchQuery: Found ${matches.length} matches matching conditions`);
            return matches;
        } catch (error) {
            logger.error('MatchQuery: Error getting matches by conditions:', error);
            return [];
        }
    }

    /**
     * Get high-scoring matches
     * @param {number} minGoals - Minimum total goals
     * @param {number} days - Number of days to look back
     * @returns {Promise<Array>} Array of high-scoring matches
     */
    static async getHighScoringMatches(minGoals = 4, days = 7) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            const highScoringMatches = [];
            
            // Query matches with high goal totals
            // This would use your existing Game model with score filtering
            
            logger.debug(`MatchQuery: Found ${highScoringMatches.length} high-scoring matches`);
            return highScoringMatches;
        } catch (error) {
            logger.error('MatchQuery: Error getting high-scoring matches:', error);
            return [];
        }
    }

    /**
     * Get matches by event
     * @param {number} eventId - Event ID
     * @returns {Promise<Array>} Array of matches for the event
     */
    static async getEventMatches(eventId) {
        try {
            const eventMatches = [];
            
            // Query matches for a specific event
            // This would use your existing Game model with event filtering
            
            logger.debug(`MatchQuery: Found ${eventMatches.length} matches for event ${eventId}`);
            return eventMatches;
        } catch (error) {
            logger.error('MatchQuery: Error getting event matches:', error);
            return [];
        }
    }

    /**
     * Get match predictions accuracy
     * @param {number} poolId - Pool ID
     * @param {number} gameId - Game ID (optional)
     * @returns {Promise<Object>} Prediction accuracy data
     */
    static async getPredictionAccuracy(poolId, gameId = null) {
        try {
            const accuracy = {
                poolId,
                gameId,
                totalPredictions: 0,
                correctPredictions: 0,
                accuracyRate: 0,
                mostPredictedOutcome: null,
                leastPredictedOutcome: null
            };
            
            // Calculate prediction accuracy from user bets
            // This would use your existing UserBets, Challenge models
            
            logger.debug(`MatchQuery: Got prediction accuracy for pool ${poolId}`);
            return accuracy;
        } catch (error) {
            logger.error('MatchQuery: Error getting prediction accuracy:', error);
            return null;
        }
    }
}

module.exports = MatchQuery;





