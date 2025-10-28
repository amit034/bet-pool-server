'use strict';

const logger = require('../../utils/logger');
const {  PoolParticipant, Bet, Game, Event, Account} = require('../../models');

/**
 * StatsQuery - Statistical query class using existing database models
 * Provides high-level data access for insights and analytics
 */
class StatsQuery {
    /**
     * Get winning streaks for all users
     * @param {number} poolId - Pool ID to check
     * @param {number} minStreak - Minimum streak length
     * @returns {Promise<Array>} Array of user streaks
     */
    static async getWinningStreaks(poolId, minStreak = 3) {
        try {
            // Get all participants in the pool
            const participants = await PoolParticipant.findAll({
                where: { poolId: poolId },
                include: [{
                    model: require('../../models').Account,
                    as: 'user',
                    attributes: ['userId', 'username']
                }]
            });

            const streaks = [];

            for (const participant of participants) {
                // Get recent bets for this participant
                const recentBets = await Bet.findAll({
                    where: { 
                        userId: participant.userId,
                        poolId: poolId
                    },
                    include: [{
                        model: Game,
                        as: 'game',
                        where: { status: 'FINISHED' },
                        include: [{
                            model: Event,
                            as: 'event',
                            where: { isActive: true }
                        }]
                    }],
                    order: [['createdAt', 'DESC']],
                    limit: 10 // Check last 10 bets
                });

                // Calculate winning streak
                let currentStreak = 0;
                for (const bet of recentBets) {
                    if (bet.isCorrect) {
                        currentStreak++;
                    } else {
                        break; // Streak broken
                    }
                }

                if (currentStreak >= minStreak) {
                    streaks.push({
                        userId: participant.userId,
                        username: participant.user?.username || `User${participant.userId}`,
                        streakLength: currentStreak,
                        poolId: poolId
                    });
                }
            }
            
            logger.debug(`StatsQuery: Found ${streaks.length} winning streaks for pool ${poolId}`);
            return streaks;
        } catch (error) {
            logger.error('StatsQuery: Error getting winning streaks:', error);
            return [];
        }
    }

    /**
     * Get top predictor for a specific period
     * @param {number} poolId - Pool ID
     * @param {string} period - Period (daily, weekly, monthly)
     * @returns {Promise<Object|null>} Top predictor data
     */
    static async getTopPredictor(poolId, period = 'weekly') {
        try {
            // Mock data for testing
            const topPredictor = {
                userId: 1,
                username: 'John',
                score: 85,
                period: period,
                poolId: poolId
            };
            
            logger.debug(`StatsQuery: Found top predictor for ${period} (mock data)`);
            return topPredictor;
        } catch (error) {
            logger.error('StatsQuery: Error getting top predictor:', error);
            return null;
        }
    }

    /**
     * Get user score trend
     * @param {number} userId - User ID
     * @param {number} poolId - Pool ID
     * @param {number} days - Number of days to look back
     * @returns {Promise<Object>} User score trend data
     */
    static async getUserScoreTrend(userId, poolId, days = 7) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            // Query user's score progression
            // This would use your existing models to track score changes
            
            const trend = {
                userId,
                poolId,
                period: `${days} days`,
                currentScore: 0,
                previousScore: 0,
                change: 0,
                trend: 'stable'
            };
            
            logger.debug(`StatsQuery: Got score trend for user ${userId}`);
            return trend;
        } catch (error) {
            logger.error('StatsQuery: Error getting user score trend:', error);
            return null;
        }
    }

    /**
     * Get pool participants with their current standings
     * @param {number} poolId - Pool ID
     * @returns {Promise<Array>} Array of participants with standings
     */
    static async getPoolStandings(poolId) {
        try {
            // Query your existing models for pool participants and their scores
            // This would use PoolParticipants, UserBets, etc.
            
            const standings = [];
            
            // Example query structure:
            // const participants = await db.PoolParticipant.findAll({
            //     where: { poolId },
            //     include: [{ model: db.Account, attributes: ['username'] }],
            //     order: [['score', 'DESC']]
            // });
            
            logger.debug(`StatsQuery: Got standings for pool ${poolId}`);
            return standings;
        } catch (error) {
            logger.error('StatsQuery: Error getting pool standings:', error);
            return [];
        }
    }

    /**
     * Get biggest jump in standings using poolUtils
     * @param {number} poolId - Pool ID
     * @param {string} granularity - Granularity to check ('round' or 'pool')
     * @returns {Promise<Object|null>} Biggest jump data
     */
    static async getBiggestJump(poolId, granularity = 'round') {
        try {
            const poolUtils = require('../../utils/poolUtils');
            const jumpResult = await poolUtils.getBiggestJump(poolId, granularity);
            
            if (!jumpResult || !jumpResult.participants || jumpResult.participants.length === 0) {
                logger.debug(`StatsQuery: No biggest jump found for pool ${poolId} with granularity ${granularity}`);
                return null;
            }

            const biggestJump = jumpResult.participants[0];
            
            // Transform to legacy format for backward compatibility
            const legacyFormat = {
                userId: biggestJump.userId,
                username: biggestJump.username,
                positionsJumped: biggestJump.biggestJump, // Using score jump as positions for compatibility
                fromPosition: biggestJump.jumpDetails ? biggestJump.jumpDetails.fromRound + 1 : 1,
                toPosition: biggestJump.jumpDetails ? biggestJump.jumpDetails.toRound + 1 : 1,
                poolId: poolId,
                period: granularity,
                scoreJump: biggestJump.biggestJump,
                jumpDetails: biggestJump.jumpDetails
            };
            
            logger.debug(`StatsQuery: Found biggest jump for ${granularity}: ${legacyFormat.scoreJump} points`);
            return legacyFormat;
        } catch (error) {
            logger.error('StatsQuery: Error getting biggest jump:', error);
            return null;
        }
    }

    /**
     * Get users who haven't bet recently
     * @param {number} poolId - Pool ID
     * @param {number} hours - Hours since last bet
     * @returns {Promise<Array>} Array of inactive users
     */
    static async getInactiveUsers(poolId, hours = 24) {
        try {
            const cutoffTime = new Date();
            cutoffTime.setHours(cutoffTime.getHours() - hours);
            
            // Get all participants in the pool
            const participants = await PoolParticipant.findAll({
                where: { poolId: poolId },
                include: [{
                    model: require('../../models').Account,
                    as: 'user',
                    attributes: ['userId', 'username']
                }]
            });

            const inactiveUsers = [];

            for (const participant of participants) {
                // Get the last bet for this user in this pool
                const lastBet = await Bet.findOne({
                    where: { 
                        userId: participant.userId,
                        poolId: poolId
                    },
                    order: [['createdAt', 'DESC']]
                });

                // Check if user hasn't bet recently or never bet
                if (!lastBet || lastBet.createdAt < cutoffTime) {
                    inactiveUsers.push({
                        userId: participant.userId,
                        username: participant.user?.username || `User${participant.userId}`,
                        lastBetAt: lastBet ? lastBet.createdAt : null,
                        poolId: poolId
                    });
                }
            }
            
            logger.debug(`StatsQuery: Found ${inactiveUsers.length} inactive users for pool ${poolId}`);
            return inactiveUsers;
        } catch (error) {
            logger.error('StatsQuery: Error getting inactive users:', error);
            return [];
        }
    }

    /**
     * Get pool statistics
     * @param {number} poolId - Pool ID
     * @returns {Promise<Object>} Pool statistics
     */
    static async getPoolStats(poolId) {
        try {
            const stats = {
                poolId,
                totalParticipants: 0,
                activeParticipants: 0,
                totalBets: 0,
                completedChallenges: 0,
                averageScore: 0,
                topScore: 0,
                lastActivity: null
            };
            
            // Query your existing models for pool statistics
            // This would aggregate data from various tables
            
            logger.debug(`StatsQuery: Got stats for pool ${poolId}`);
            return stats;
        } catch (error) {
            logger.error('StatsQuery: Error getting pool stats:', error);
            return null;
        }
    }

    /**
     * Get recent activity in pool
     * @param {number} poolId - Pool ID
     * @param {number} limit - Number of activities to return
     * @returns {Promise<Array>} Array of recent activities
     */
    static async getRecentActivity(poolId, limit = 10) {
        try {
            // Get recent betting activity, score changes, etc.
            // This would query UserBets, Challenges, etc.
            
            const activities = [];
            
            logger.debug(`StatsQuery: Got ${activities.length} recent activities`);
            return activities;
        } catch (error) {
            logger.error('StatsQuery: Error getting recent activity:', error);
            return [];
        }
    }

    /**
     * Get date range for a period
     * @param {string} period - Period (daily, weekly, monthly)
     * @returns {Object} Date range object
     */
    static getDateRange(period) {
        const now = new Date();
        const start = new Date();
        
        switch (period) {
            case 'daily':
                start.setDate(now.getDate() - 1);
                break;
            case 'weekly':
                start.setDate(now.getDate() - 7);
                break;
            case 'monthly':
                start.setMonth(now.getMonth() - 1);
                break;
            default:
                start.setDate(now.getDate() - 1);
        }
        
        return { start, end: now };
    }

    /**
     * Get user performance summary
     * @param {number} userId - User ID
     * @param {number} poolId - Pool ID
     * @returns {Promise<Object>} User performance summary
     */
    static async getUserPerformance(userId, poolId) {
        try {
            const performance = {
                userId,
                poolId,
                totalBets: 0,
                correctBets: 0,
                accuracy: 0,
                currentScore: 0,
                rank: 0,
                bestStreak: 0,
                worstStreak: 0
            };
            
            // Query user's betting performance
            // This would use your existing models to calculate performance metrics
            
            logger.debug(`StatsQuery: Got performance for user ${userId}`);
            return performance;
        } catch (error) {
            logger.error('StatsQuery: Error getting user performance:', error);
            return null;
        }
    }
}

module.exports = StatsQuery;





