'use strict';

const BaseEngagementModule = require('../core/BaseEngagementModule');
const StatsQuery = require('../services/StatsQuery');
const logger = require('../../utils/logger');
const { WinningStreakTemplate } = require('../templates');

/**
 * Winning Streak Insight - Detects and reports winning streaks
 * Triggers when a user achieves a significant winning streak
 */
class WinningStreakInsight extends BaseEngagementModule {
    constructor(config = {}) {
        super({
            type: 'insight',
            id: 'winning_streak',
            name: 'Winning Streak Alert',
            priority: 'high',
            schedule: 'always',
            cooldown: 3600000, // 1 hour
            ...config
        });
        
        this.minStreakLength = config.minStreakLength || 3;
        this.poolId = config.poolId;
        this.locale = config.locale || 'he'; // Default to Hebrew
    }

    /**
     * Check if a winning streak should trigger this insight
     * @returns {Promise<boolean>} True if insight should trigger
     */
    async shouldTrigger() {
        try {
            if (this.isOnCooldown()) {
                logger.debug(`WinningStreakInsight: On cooldown, skipping trigger check`);
                return false;
            }

            // Get winning streaks from the database
            const streaks = await StatsQuery.getWinningStreaks(this.poolId, this.minStreakLength);
            
            logger.debug(`WinningStreakInsight: Found ${streaks.length} streaks, checking conditions...`);
            
            if (streaks.length === 0) {
                logger.debug(`WinningStreakInsight: No streaks found, conditions not met`);
                return false;
            }

            // Check if any streak is new or has increased
            const newStreaks = streaks.filter(streak => 
                streak.streakLength >= this.minStreakLength && 
                !streak.reported
            );

            logger.debug(`WinningStreakInsight: Found ${newStreaks.length} new streaks (min: ${this.minStreakLength})`);
            
            if (newStreaks.length > 0) {
                logger.info(`WinningStreakInsight: ✅ CONDITIONS MET - ${newStreaks.length} new winning streaks found! CANDIDATE FOR MESSAGE`);
                newStreaks.forEach(streak => {
                    logger.info(`WinningStreakInsight: 🏆 Streak: ${streak.username} has ${streak.streakLength} wins`);
                });
                return true;
            } else {
                logger.debug(`WinningStreakInsight: No new streaks meet criteria, conditions not met`);
                return false;
            }
        } catch (error) {
            logger.error('WinningStreakInsight: Error checking trigger:', error);
            return false;
        }
    }

    /**
     * Build the winning streak message
     * @returns {Promise<Object>} Message object
     */
    async buildMessage() {
        try {
            const streaks = await StatsQuery.getWinningStreaks(this.poolId, this.minStreakLength);
            const topStreak = streaks[0]; // Assuming sorted by streak length
            
            if (!topStreak) {
                throw new Error('No winning streak found');
            }

            const message = {
                type: 'insight',
                content: this.formatStreakMessage(topStreak),
                metadata: {
                    source: 'Winning Streak Insight',
                    userId: topStreak.userId,
                    streakLength: topStreak.count,
                    poolId: this.poolId
                }
            };

            // Mark streak as reported
            await this.markStreakReported(topStreak.userId);

            return message;
        } catch (error) {
            logger.error('WinningStreakInsight: Error building message:', error);
            throw error;
        }
    }

    /**
     * Format the winning streak message
     * @param {Object} streak - Streak data
     * @returns {string} Formatted message
     */
    formatStreakMessage(streak) {
        // Prepare data for template
        const data = {
            username: streak.username,
            firstName: streak.firstName,
            lastName: streak.lastName,
            streakLength: streak.count || streak.streakLength
        };
        
        // Use the template
        return WinningStreakTemplate.build(data, this.locale);
    }

    /**
     * Mark a streak as reported to avoid duplicate messages
     * @param {number} userId - User ID
     */
    async markStreakReported(userId) {
        try {
            // This would update your database to mark the streak as reported
            // You could add a field to track reported streaks
            logger.debug(`WinningStreakInsight: Marked streak as reported for user ${userId}`);
        } catch (error) {
            logger.error('WinningStreakInsight: Error marking streak as reported:', error);
        }
    }
}

module.exports = WinningStreakInsight;

