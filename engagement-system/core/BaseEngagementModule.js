'use strict';

/**
 * Base Engagement Module Class - Abstract base class for all engagement modules
 * (Insights, Notifications, Polls)
 * 
 * Provides common functionality and interface that all engagement modules share:
 * - Lifecycle management (triggering, cooldown, statistics)
 * - Configuration management
 * - Status management (active/disabled)
 * 
 * This follows DRY principles by extracting common code from BaseInsight, BasePoll, etc.
 */
class BaseEngagementModule {
    constructor(config = {}) {
        // Core identity
        this.id = config.id || this.constructor.name.toLowerCase();
        this.name = config.name || this.constructor.name;
        this.type = config.type || 'module'; // 'insight', 'notification', 'poll'
        
        // Scheduling and priority
        this.priority = config.priority || 'medium';
        this.schedule = config.schedule || 'always';
        this.status = config.status || 'active';
        
        // Cooldown management
        this.cooldown = config.cooldown || 3600000; // 1 hour default
        this.lastTriggered = null;
        this.triggerCount = 0;
    }

    /**
     * Abstract method - MUST be implemented by subclasses
     * Determines if this module should trigger
     * @returns {Promise<boolean>} True if module should trigger
     */
    async shouldTrigger() {
        throw new Error(`${this.constructor.name}: shouldTrigger() must be implemented by subclass`);
    }

    /**
     * Abstract method - MUST be implemented by subclasses
     * Builds the message/content for this module
     * @returns {Promise<Object>} Message object with content and metadata
     */
    async buildMessage() {
        throw new Error(`${this.constructor.name}: buildMessage() must be implemented by subclass`);
    }

    /**
     * Check if this module is on cooldown
     * @returns {boolean} True if on cooldown
     */
    isOnCooldown() {
        if (!this.lastTriggered) {
            return false;
        }
        
        const timeSinceLastTrigger = Date.now() - this.lastTriggered;
        return timeSinceLastTrigger < this.cooldown;
    }

    /**
     * Get remaining cooldown time in milliseconds
     * @returns {number} Milliseconds remaining, or 0 if not on cooldown
     */
    getCooldownRemaining() {
        if (!this.isOnCooldown()) {
            return 0;
        }
        return this.cooldown - (Date.now() - this.lastTriggered);
    }

    /**
     * Mark this module as triggered
     * Can be overridden by subclasses to add additional behavior
     */
    markTriggered() {
        this.lastTriggered = Date.now();
        this.triggerCount++;
    }

    /**
     * Get module statistics
     * Can be overridden by subclasses to add additional stats
     * @returns {Object} Statistics about this module
     */
    getStats() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            priority: this.priority,
            schedule: this.schedule,
            status: this.status,
            triggerCount: this.triggerCount,
            lastTriggered: this.lastTriggered,
            isOnCooldown: this.isOnCooldown(),
            cooldownRemaining: this.getCooldownRemaining()
        };
    }

    /**
     * Update module configuration
     * @param {Object} newConfig - New configuration options
     */
    updateConfig(newConfig) {
        Object.assign(this, newConfig);
    }

    /**
     * Activate this module
     */
    activate() {
        this.status = 'active';
    }

    /**
     * Deactivate this module
     */
    deactivate() {
        this.status = 'disabled';
    }

    /**
     * Check if module is active
     * @returns {boolean} True if active
     */
    isActive() {
        return this.status === 'active';
    }

    /**
     * Reset module statistics
     * Can be overridden by subclasses to reset additional fields
     */
    reset() {
        this.lastTriggered = null;
        this.triggerCount = 0;
    }

    /**
     * Get module configuration for storage
     * Can be overridden by subclasses to include additional config
     * @returns {Object} Configuration object
     */
    getConfig() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            priority: this.priority,
            schedule: this.schedule,
            status: this.status,
            cooldown: this.cooldown
        };
    }
}

module.exports = BaseEngagementModule;




