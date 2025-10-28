'use strict';

const { InsightRegistry } = require('../insights');
const { NotificationRegistry } = require('../notifications');
const PollRegistry = require('./PollRegistry');
const MessageLimiter = require('../services/MessageLimiter');
const logger = require('../../utils/logger');

/**
 * EngagementManager - Platform-agnostic, fully polymorphic engagement orchestrator
 * 
 * Processes ALL engagement modules (insights, notifications, polls) using the same pattern:
 * 1. Check shouldTrigger()
 * 2. Build message via buildMessage()
 * 3. Send via platform
 * 4. Call optional post-send hook
 * 
 * No special handling for specific module types - true polymorphism!
 */
class EngagementManager {
    constructor(platform = null) {
        this.platform = platform;
        this.isRunning = false;
        this.runInterval = 60000; // 1 minute
        this.intervalId = null;
        
        // Registry of all module sources
        this.registries = [
            { name: 'Insights', registry: InsightRegistry },
            { name: 'Notifications', registry: NotificationRegistry },
            { name: 'Polls', registry: PollRegistry }
        ];
    }

    /**
     * Set the platform to use
     * @param {BasePlatform} platform - Platform instance (TelegramPlatform, WhatsAppPlatform, etc.)
     */
    setPlatform(platform) {
        this.platform = platform;
        logger.info(`EngagementManager: Platform set to ${platform.getPlatformName()}`);
    }

    /**
     * Get current platform
     * @returns {BasePlatform}
     */
    getPlatform() {
        return this.platform;
    }

    /**
     * Start the engagement manager
     */
    async start() {
        if (this.isRunning) {
            logger.warn('EngagementManager: Already running');
            return;
        }

        if (!this.platform) {
            logger.error('EngagementManager: No platform configured');
            throw new Error('Platform must be set before starting');
        }

        logger.info(`EngagementManager: Starting with ${this.platform.getPlatformName()} platform...`);
        this.isRunning = true;

        // Run immediately
        await this.run();

        // Schedule regular runs
        this.intervalId = setInterval(() => {
            this.run();
        }, this.runInterval);

        logger.info(`EngagementManager: Started successfully on ${this.platform.getPlatformName()}`);
    }

    /**
     * Stop the engagement manager
     */
    async stop() {
        if (!this.isRunning) {
            logger.warn('EngagementManager: Not running');
            return;
        }

        logger.info('EngagementManager: Stopping...');
        this.isRunning = false;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        logger.info('EngagementManager: Stopped successfully');
    }

    /**
     * Main run cycle - Completely polymorphic, processes all module types the same way
     */
    async run() {
        try {
            logger.debug(`EngagementManager: Running cycle on ${this.platform.getPlatformName()}...`);

            // Process all modules from all registries polymorphically
            for (const { name, registry } of this.registries) {
                await this.processModules(registry, name);
            }

            logger.debug('EngagementManager: Cycle completed');
        } catch (error) {
            logger.error('EngagementManager: Error in run cycle:', error);
        }
    }

    /**
     * Process all active modules from a registry - FULLY POLYMORPHIC
     * Works identically for insights, notifications, and polls
     * 
     * @param {BaseRegistry} registry - Any registry (InsightRegistry, NotificationRegistry, PollRegistry)
     * @param {string} registryName - Name for logging
     */
    async processModules(registry, registryName) {
        const activeModules = registry.getActiveModules();
        logger.debug(`EngagementManager: Processing ${activeModules.length} active ${registryName.toLowerCase()}`);

        for (const module of activeModules) {
            try {
                // 1. Check if module should trigger (polymorphic - all modules have this)
                if (await module.shouldTrigger()) {
                    logger.debug(`EngagementManager: Module ${module.id} (${module.type}) triggered`);
                    
                    // 2. Check rate limiting
                    if (MessageLimiter.canSend(module.id, module.priority || 'regular')) {
                        // 3. Build message (polymorphic - all modules have this)
                        const message = await module.buildMessage();
                        
                        // 4. Send via platform (polymorphic - platform handles all message types)
                        await this.sendModuleMessage(module, message);
                        
                        // 5. Optional post-send hook (polymorphic - modules can define this)
                        if (module.onMessageSent && typeof module.onMessageSent === 'function') {
                            await module.onMessageSent();
                        }
                        
                        // 6. Mark as triggered (polymorphic - all modules have this)
                        module.markTriggered();
                        
                        // 7. Record in limiter
                        MessageLimiter.markSent(module.id, module.priority || 'regular');
                        
                        logger.info(`EngagementManager: Sent ${module.type} ${module.id} via ${this.platform.getPlatformName()}`);
                    } else {
                        logger.debug(`EngagementManager: Rate limited for module ${module.id}`);
                    }
                }
            } catch (error) {
                logger.error(`EngagementManager: Error processing module ${module.id}:`, error);
            }
        }
    }

    /**
     * Send a module's message via the appropriate platform method
     * Determines the right platform method based on message type
     * 
     * @param {BaseEngagementModule} module - The module
     * @param {Object} message - The message to send
     */
    async sendModuleMessage(module, message) {
        // Check if message has a poll structure
        if (message.type === 'poll' || (message.question && message.options)) {
            return await this.platform.sendPoll(message);
        }
        
        // Default: send as regular message
        return await this.platform.sendMessage(message);
    }

    /**
     * Send a custom message (useful for manual triggers)
     * @param {Object|string} message - Message to send
     * @returns {Promise<Object>} Send result
     */
    async sendMessage(message) {
        if (!this.platform) {
            throw new Error('No platform configured');
        }
        
        return await this.platform.sendMessage(message);
    }

    /**
     * Send a custom poll (useful for manual triggers)
     * @param {Object} poll - Poll to send
     * @returns {Promise<Object>} Send result
     */
    async sendPoll(poll) {
        if (!this.platform) {
            throw new Error('No platform configured');
        }
        
        return await this.platform.sendPoll(poll);
    }

    /**
     * Get all active modules across all registries
     * @returns {Array<BaseEngagementModule>} All active modules
     */
    getAllActiveModules() {
        const allModules = [];
        
        for (const { registry } of this.registries) {
            allModules.push(...registry.getActiveModules());
        }
        
        return allModules;
    }

    /**
     * Get manager status
     */
    getStatus() {
        const status = {
            isRunning: this.isRunning,
            runInterval: this.runInterval,
            platform: this.platform ? {
                name: this.platform.getPlatformName(),
                isInitialized: this.platform.isInitialized,
                mockMode: this.platform.isMockMode()
            } : null
        };

        // Add count for each registry
        for (const { name, registry } of this.registries) {
            const key = `active${name}`;
            status[key] = registry.getActiveModules().length;
        }

        return status;
    }
}

// Create singleton instance
const engagementManager = new EngagementManager();

module.exports = engagementManager;
