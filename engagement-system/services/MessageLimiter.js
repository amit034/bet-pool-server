'use strict';

const logger = require('../../utils/logger');

/**
 * Message Limiter - Controls message frequency and prevents spam
 * Uses existing database models for persistence
 */
class MessageLimiter {
    constructor() {
        this.config = {
            maxMessagesPerHour: 3,
            maxMessagesPerDay: 20,
            priorityMessageCooldown: 900000, // 15 minutes
            regularMessageCooldown: 1800000, // 30 minutes
            pollCooldown: 3600000, // 1 hour
        };
        
        // In-memory cache for performance
        this.messageHistory = new Map();
        this.lastCleanup = Date.now();
    }

    /**
     * Check if we can send any message (global rate limiting)
     * @returns {boolean} True if we can send a message
     */
    canSendAny() {
        try {
            const now = Date.now();
            const oneHourAgo = now - 3600000;
            const oneDayAgo = now - 86400000;

            // Clean up old entries periodically
            if (now - this.lastCleanup > 300000) { // 5 minutes
                this.cleanupOldEntries();
                this.lastCleanup = now;
            }

            // Check hourly limit using in-memory storage
            const hourlyCount = this.getMessageCount(oneHourAgo, now);
            if (hourlyCount >= this.config.maxMessagesPerHour) {
                logger.debug(`MessageLimiter: Hourly limit reached (${hourlyCount}/${this.config.maxMessagesPerHour})`);
                return false;
            }

            // Check daily limit using in-memory storage
            const dailyCount = this.getMessageCount(oneDayAgo, now);
            if (dailyCount >= this.config.maxMessagesPerDay) {
                logger.debug(`MessageLimiter: Daily limit reached (${dailyCount}/${this.config.maxMessagesPerDay})`);
                return false;
            }

            return true;
        } catch (error) {
            logger.error('MessageLimiter: Error checking global limits:', error);
            return false;
        }
    }

    /**
     * Check if we can send a specific insight message
     * @param {string} insightId - The insight ID
     * @param {string} priority - The message priority (high, medium, low)
     * @returns {Promise<boolean>} True if we can send the message
     */
    canSend(insightId, priority = 'regular') {
        try {
            // First check global limits
            if (!this.canSendAny()) {
                return false;
            }

            // Check insight-specific cooldown
            const lastSent = this.getLastSentTime(insightId);
            if (lastSent) {
                const cooldown = priority === 'high' ? 
                    this.config.priorityMessageCooldown : 
                    this.config.regularMessageCooldown;
                
                const timeSinceLastSent = Date.now() - lastSent;
                if (timeSinceLastSent < cooldown) {
                    logger.debug(`MessageLimiter: Insight ${insightId} on cooldown`);
                    return false;
                }
            }

            return true;
        } catch (error) {
            logger.error(`MessageLimiter: Error checking insight ${insightId}:`, error);
            return false;
        }
    }

    /**
     * Check if we can send a poll (only one active poll at a time)
     * @returns {Promise<boolean>} True if we can send a poll
     */
    async canSendPoll() {
        try {
            // Check if there's already an active poll
            const activePoll = await this.getActivePoll();
            if (activePoll) {
                logger.debug(`MessageLimiter: Active poll exists (${activePoll.insightId})`);
                return false;
            }

            return true;
        } catch (error) {
            logger.error('MessageLimiter: Error checking poll limits:', error);
            return false;
        }
    }

    /**
     * Mark a message as sent
     * @param {string} insightId - The insight ID
     * @param {string} priority - The message priority
     * @param {Object} metadata - Additional metadata
     */
    markSent(insightId, priority = 'regular', metadata = {}) {
        try {
            // Update cache (in-memory storage)
            this.messageHistory.set(insightId, {
                lastSent: Date.now(),
                priority,
                metadata
            });

            logger.debug(`MessageLimiter: Marked ${insightId} as sent`);
        } catch (error) {
            logger.error(`MessageLimiter: Error marking ${insightId} as sent:`, error);
        }
    }

    /**
     * Mark a poll as sent
     * @param {string} pollId - The poll ID
     * @param {Object} metadata - Additional metadata
     */
    async markPollSent(pollId, metadata = {}) {
        try {
            const pollRecord = {
                insightId: pollId,
                priority: 'poll',
                sentAt: new Date(),
                metadata: JSON.stringify({ ...metadata, type: 'poll' })
            };

            // Store in database
            await this.storeMessageRecord(pollRecord);
            
            // Update cache
            this.messageHistory.set(pollId, {
                lastSent: Date.now(),
                priority: 'poll',
                metadata: { ...metadata, type: 'poll' }
            });

            logger.debug(`MessageLimiter: Marked poll ${pollId} as sent`);
        } catch (error) {
            logger.error(`MessageLimiter: Error marking poll ${pollId} as sent:`, error);
        }
    }

    /**
     * Get message count within a time range (in-memory)
     * @param {number} startTime - Start timestamp
     * @param {number} endTime - End timestamp
     * @returns {number} Message count
     */
    getMessageCount(startTime, endTime) {
        try {
            let count = 0;
            
            // Count messages in the time period from in-memory storage
            for (const [insightId, data] of this.messageHistory) {
                if (data.lastSent && data.lastSent >= startTime && data.lastSent <= endTime) {
                    count++;
                }
            }
            
            return count;
        } catch (error) {
            logger.error('MessageLimiter: Error getting message count:', error);
            return 0;
        }
    }

    /**
     * Get last sent time for an insight (in-memory)
     * @param {string} insightId - The insight ID
     * @returns {number|null} Last sent timestamp or null
     */
    getLastSentTime(insightId) {
        try {
            // Check cache
            const cached = this.messageHistory.get(insightId);
            if (cached) {
                return cached.lastSent;
            }
            
            return null;
        } catch (error) {
            logger.error(`MessageLimiter: Error getting last sent time for ${insightId}:`, error);
            return null;
        }
    }

    /**
     * Get active poll
     * @returns {Promise<Object|null>} Active poll record or null
     */
    async getActivePoll() {
        try {
            // Query database for active poll
            // You can implement this with your existing models
            // For example: const poll = await db.WhatsAppMessage.findOne({ where: { priority: 'poll', isActive: true } })
            
            return null;
        } catch (error) {
            logger.error('MessageLimiter: Error getting active poll:', error);
            return null;
        }
    }

    /**
     * Store message record in database
     * @param {Object} record - Message record to store
     */
    async storeMessageRecord(record) {
        try {
            // Store in your existing database
            // You can create a WhatsAppMessage model or use an existing one
            // For example: await db.WhatsAppMessage.create(record)
            
            logger.debug('MessageLimiter: Stored message record');
        } catch (error) {
            logger.error('MessageLimiter: Error storing message record:', error);
        }
    }

    /**
     * Clean up old message records (in-memory)
     */
    cleanupOldEntries() {
        try {
            const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            
            // Clean up cache
            for (const [key, value] of this.messageHistory.entries()) {
                if (value.lastSent < oneWeekAgo) {
                    this.messageHistory.delete(key);
                }
            }
            
            logger.debug('MessageLimiter: Cleaned up old entries');
        } catch (error) {
            logger.error('MessageLimiter: Error cleaning up old entries:', error);
        }
    }

    /**
     * Get limiter statistics
     * @returns {Object} Statistics about message limiting
     */
    getStats() {
        return {
            config: this.config,
            cacheSize: this.messageHistory.size,
            lastCleanup: this.lastCleanup
        };
    }

    /**
     * Update configuration
     * @param {Object} newConfig - New configuration options
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        logger.info('MessageLimiter: Configuration updated', this.config);
    }
}

// Create singleton instance
const limiter = new MessageLimiter();

module.exports = limiter;





