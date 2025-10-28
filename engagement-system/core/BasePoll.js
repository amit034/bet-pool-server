'use strict';

const BaseEngagementModule = require('./BaseEngagementModule');

/**
 * Base Poll Class - Base class for all poll modules
 * Extends BaseEngagementModule with poll-specific functionality
 * 
 * Polls are interactive messages that collect user responses and have:
 * - Validity period (polls expire after a certain time)
 * - Active state tracking
 * - Result processing callbacks
 */
class BasePoll extends BaseEngagementModule {
    constructor(config = {}) {
        super({
            type: 'poll',
            schedule: 'match_days', // Polls typically run on match days
            ...config
        });
        
        // Poll-specific properties
        this.validUntil = null;
        this.pollIsActive = false; // Renamed to avoid confusion with isActive() method
    }

    /**
     * Abstract method - MUST be implemented by subclasses
     * Processes poll results when poll closes
     * @param {Object} results - Poll response data
     * @returns {Promise<void>}
     */
    async onResult(results) {
        throw new Error(`${this.constructor.name}: onResult() must be implemented by subclass`);
    }

    /**
     * Check if this poll is still valid (not expired)
     * @returns {boolean} True if poll is still valid
     */
    isValid() {
        if (!this.validUntil) {
            return true; // No expiry set means always valid
        }
        
        return Date.now() < this.validUntil;
    }

    /**
     * Mark this poll as triggered
     * Overrides base implementation to add validity tracking
     * @param {number} validFor - How long the poll should be valid (in milliseconds)
     */
    markTriggered(validFor = 3600000) { // 1 hour default
        super.markTriggered(); // Call parent's markTriggered
        
        this.validUntil = Date.now() + validFor;
        this.pollIsActive = true;
    }

    /**
     * Mark this poll as closed/inactive
     */
    markClosed() {
        this.pollIsActive = false;
        this.validUntil = null;
    }

    /**
     * Get poll statistics
     * Overrides base implementation to add poll-specific stats
     * @returns {Object} Statistics about this poll
     */
    getStats() {
        const baseStats = super.getStats(); // Get base stats
        
        return {
            ...baseStats,
            // Add poll-specific stats
            pollIsActive: this.pollIsActive,
            isValid: this.isValid(),
            validUntil: this.validUntil
        };
    }

    /**
     * Reset poll statistics
     * Overrides base implementation to reset poll-specific fields
     */
    reset() {
        super.reset(); // Reset base fields
        
        // Reset poll-specific fields
        this.pollIsActive = false;
        this.validUntil = null;
    }
}

module.exports = BasePoll;
