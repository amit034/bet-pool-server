'use strict';

const BaseEngagementModule = require('../core/BaseEngagementModule');
const { PoolParticipant, Account } = require('../../models');
const logger = require('../../utils/logger');
const { WelcomeTemplate } = require('../templates');
/**
 * Welcome Users Notification - Welcomes new users to the pool
 * Triggers when a new user joins the pool
 */
class WelcomeUsersNotification extends BaseEngagementModule {
    constructor(config = {}) {
        super({
            type: 'notification',
            id: 'welcome_users',
            name: 'Welcome Users',
            priority: 'high',
            schedule: 'always',
            cooldown: 3600000, // 1 hour
            ...config
        });
        
        this.poolId = config.poolId;
        this.welcomeMessage = config.welcomeMessage || 'Welcome to the pool! 🎉';
        this.lookbackHours = config.lookbackHours || 1; // How many hours back to look for new users
        this.locale = config.locale || 'he'; // Default to Hebrew
    }

    /**
     * Check if new user welcome notification should trigger
     * @returns {Promise<boolean>} True if notification should trigger
     */
    async shouldTrigger() {
        try {
            if (this.isOnCooldown()) {
                logger.debug(`WelcomeUsersNotification: On cooldown, skipping trigger check`);
                return false;
            }

            // Check for new users in the last X hours
            const newUsers = await this.getRecentNewUsers();
            
            logger.debug(`WelcomeUsersNotification: Found ${newUsers.length} new users in last ${this.lookbackHours} hours`);
            
            if (newUsers.length > 0) {
                logger.info(`WelcomeUsersNotification: ✅ CONDITIONS MET - ${newUsers.length} new users found! CANDIDATE FOR MESSAGE`);
                newUsers.forEach(user => {
                    logger.info(`WelcomeUsersNotification: 👋 New user: ${user.username} needs welcome`);
                });
                return true;
            } else {
                logger.debug(`WelcomeUsersNotification: No new users found, conditions not met`);
                return false;
            }
        } catch (error) {
            logger.error('WelcomeUsersNotification: Error checking trigger:', error);
            return false;
        }
    }

    /**
     * Build the new user welcome message
     * @returns {Promise<Object>} Message object
     */
    async buildMessage() {
        try {
            const newUsers = await this.getRecentNewUsers();
            
            if (newUsers.length === 0) {
                throw new Error('No new users found');
            }

            const message = {
                type: 'welcome',
                content: this.formatWelcomeMessage(newUsers),
                metadata: {
                    source: 'Welcome Users Notification',
                    newUserCount: newUsers.length,
                    poolId: this.poolId,
                    userIds: newUsers.map(u => u.userId)
                }
            };

            return message;
        } catch (error) {
            logger.error('WelcomeUsersNotification: Error building message:', error);
            throw error;
        }
    }

    /**
     * Get new users who haven't been welcomed yet
     * @returns {Promise<Array>} Array of new users
     */
    async getRecentNewUsers() {
        try {
            const newUsers = await PoolParticipant.findAll({
                where: {
                    poolId: this.poolId,
                    joined: true,
                    welcomeSent: false
                },
                include: [{
                    model: Account,
                    as: 'user',
                    attributes: ['userId', 'username', 'firstName', 'lastName']
                }],
                order: [['id', 'DESC']] // Order by ID
            });

            logger.debug(`WelcomeUsersNotification: Found ${newUsers.length} participants with joined=true, welcomeSent=false`);

            return newUsers.map(participant => ({
                userId: participant.userId,
                username: participant.user?.username || `User${participant.userId}`,
                firstName: participant.user?.firstName,
                lastName: participant.user?.lastName,
                poolId: participant.poolId
            }));
        } catch (error) {
            logger.error('WelcomeUsersNotification: Error getting new users:', error);
            return [];
        }
    }

    /**
     * Mark users as welcomed after successful message send
     * This should be called after the message is successfully sent to WhatsApp
     */
    async markUsersAsWelcomed() {
        try {
            await PoolParticipant.update(
                { welcomeSent: true },
                {
                    where: {
                        poolId: this.poolId,
                        joined: true,
                        welcomeSent: false
                    }
                }
            );
            logger.info(`WelcomeUsersNotification: Marked users as welcomed in pool ${this.poolId}`);
        } catch (markError) {
            logger.error('WelcomeUsersNotification: Error marking users as welcomed:', markError);
        }
    }

    /**
     * Format the welcome message
     * @param {Array} newUsers - Array of new users
     * @returns {string} Formatted welcome message
     */
    formatWelcomeMessage(newUsers) {
        return WelcomeTemplate.build(newUsers, this.locale);
    }
}

module.exports = WelcomeUsersNotification;

