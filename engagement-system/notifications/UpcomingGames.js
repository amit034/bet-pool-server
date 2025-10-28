'use strict';

const BaseEngagementModule = require('../core/BaseEngagementModule');
const GameListHelper = require('./gameListHelper');
const logger = require('../../utils/logger');
const { UpcomingGamesTemplate, ReminderTemplate } = require('../templates');

/**
 * Upcoming Games Notification - Notifies users about games available to bet on
 * Can be extended for different notification types (announcements, reminders)
 */
class UpcomingGames extends BaseEngagementModule {
    constructor(config = {}) {
        super({
            type: 'notification',
            id: 'upcoming_games',
            name: 'Upcoming Games',
            priority: 'high',
            schedule: 'always',
            cooldown: 43200000, // 12 hours
            ...config
        });
        
        this.poolId = config.poolId;
        this.timeFilter = config.timeFilter || 'all'; // 'all' or 'day'
        this.minGamesToTrigger = config.minGamesToTrigger || 1;
        this.locale = config.locale || 'he';
        
        // Configuration attributes for polymorphic behavior
        this.messageType = config.messageType || 'notification';
        this.messageSource = config.messageSource || 'Upcoming Games';
        this.template = config.template || UpcomingGamesTemplate;
        this.logPrefix = config.logPrefix || 'UpcomingGames';
        this.notificationStartHour = config.notificationStartHour || 8;
        this.notificationEndHour = config.notificationEndHour || 23;
    }

    /**
     * Check if notification should trigger
     * @returns {Promise<boolean>} True if notification should trigger
     */
    async shouldTrigger() {
        try {
            if (this.isOnCooldown()) {
                logger.debug(`${this.logPrefix}: On cooldown, skipping trigger check`);
                return false;
            }

            // Get upcoming games based on time filter
            const games = await GameListHelper.getUpcomingGames(this.poolId, this.timeFilter);
            
            logger.debug(`${this.logPrefix}: Found ${games.length} upcoming games (filter: ${this.timeFilter})`);
            
            if (games.length >= this.minGamesToTrigger) {
                const isGoodTime = this.isGoodTimeToNotify();
                
                if (isGoodTime) {
                    logger.info(`${this.logPrefix}: ✅ CONDITIONS MET - ${games.length} upcoming games found! CANDIDATE FOR MESSAGE`);
                    return true;
                } else {
                    logger.debug(`${this.logPrefix}: Games found but not good time to notify`);
                    return false;
                }
            } else {
                logger.debug(`${this.logPrefix}: Not enough games (${games.length} < ${this.minGamesToTrigger})`);
                return false;
            }
        } catch (error) {
            logger.error(`${this.logPrefix}: Error checking trigger:`, error);
            return false;
        }
    }

    /**
     * Build the notification message
     * @returns {Promise<Object>} Message object
     */
    async buildMessage() {
        try {
            const stats = await GameListHelper.getGameStats(this.poolId, this.timeFilter);
            
            if (stats.totalGames === 0) {
                throw new Error('No upcoming games found');
            }

            const message = {
                type: this.messageType,
                content: this.formatMessage(stats),
                metadata: {
                    source: this.messageSource,
                    totalGames: stats.totalGames,
                    mainGames: stats.mainGames,
                    timeFilter: this.timeFilter,
                    poolId: this.poolId
                }
            };

            return message;
        } catch (error) {
            logger.error(`${this.logPrefix}: Error building message:`, error);
            throw error;
        }
    }

    /**
     * Format the message using the configured template
     * @param {Object} stats - Game statistics object
     * @returns {string} Formatted message
     */
    formatMessage(stats) {
        const gameList = GameListHelper.formatGameList(stats.mainGamesList, false);
        return this.template.build(stats, this.timeFilter, gameList, this.locale);
    }

    /**
     * Check if it's a good time to send the notification
     * @returns {boolean} True if it's a good time
     */
    isGoodTimeToNotify() {
        const now = new Date();
        const hour = now.getHours();
        return hour >= this.notificationStartHour && hour <= this.notificationEndHour;
    }
}

module.exports = UpcomingGames;

