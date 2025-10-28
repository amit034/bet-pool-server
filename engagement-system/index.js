'use strict';

const EngagementManager = require('./core/EngagementManager');
const TelegramPlatform = require('./platforms/TelegramPlatform');
const WhatsAppPlatform = require('./platforms/WhatsAppPlatform');
const MockPlatform = require('./platforms/MockPlatform');
const { loadInsights } = require('./insights');
const { loadNotifications } = require('./notifications');
const { loadPolls } = require('./polls');
const config = require('./config/default');
const logger = require('../utils/logger');

/**
 * Unified Engagement System
 * Platform-agnostic engagement system that works with any social media platform
 * 
 * Supported platforms:
 * - Telegram
 * - WhatsApp
 * - Instagram (future)
 * - Facebook (future)
 */
class EngagementSystem {
    constructor() {
        this.config = config;
        this.manager = EngagementManager;
        this.platform = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the engagement system
     * Creates the appropriate platform based on configuration
     */
    async initialize() {
        try {
            // Prevent double initialization
            if (this.isInitialized) {
                logger.info('EngagementSystem: Already initialized, skipping...');
                return true;
            }
            
            if (!this.config.enabled) {
                logger.info('EngagementSystem: System is disabled');
                return false;
            }

            logger.info('EngagementSystem: Initializing...');
            logger.info(`EngagementSystem: Selected platform: ${this.config.platform}`);

            // Create platform instance based on configuration
            this.platform = await this.createPlatform(this.config.platform);
            
            if (!this.platform) {
                logger.error('EngagementSystem: Failed to create platform');
                return false;
            }

            // Initialize platform
            await this.platform.initialize();

            // Set platform in manager
            this.manager.setPlatform(this.platform);

            // Load insights (platform-agnostic)
            logger.info('EngagementSystem: Loading insights...');
            await loadInsights({
                poolId: this.config.poolId,
                insights: this.config.insights
            });

            // Load notifications (platform-agnostic)
            logger.info('EngagementSystem: Loading notifications...');
            await loadNotifications({
                poolId: this.config.poolId,
                notifications: this.config.notifications
            });

            // Load polls (platform-agnostic)
            logger.info('EngagementSystem: Loading polls...');
            await loadPolls({
                poolId: this.config.poolId,
                polls: this.config.polls
            });

            this.isInitialized = true;
            logger.info(`EngagementSystem: Initialized successfully with ${this.config.platform} platform`);
            
            return true;
        } catch (error) {
            logger.error('EngagementSystem: Error initializing:', error);
            return false;
        }
    }

    /**
     * Create platform instance based on platform name
     * @param {string} platformName - Platform name ('telegram', 'whatsapp', etc.)
     * @returns {BasePlatform} Platform instance
     */
    async createPlatform(platformName) {
        try {
            const platformLower = platformName.toLowerCase();
            
            switch (platformLower) {
                case 'mock':
                    logger.info('EngagementSystem: Creating Mock platform (for testing)...');
                    return new MockPlatform(this.config.mock || {});
                
                case 'telegram':
                    logger.info('EngagementSystem: Creating Telegram platform...');
                    return new TelegramPlatform(this.config.telegram);
                
                case 'whatsapp':
                    logger.info('EngagementSystem: Creating WhatsApp platform...');
                    return new WhatsAppPlatform(this.config.whatsapp);
                
                case 'instagram':
                    logger.warn('EngagementSystem: Instagram platform not yet implemented');
                    // return new InstagramPlatform(this.config.instagram);
                    return null;
                
                case 'facebook':
                    logger.warn('EngagementSystem: Facebook platform not yet implemented');
                    // return new FacebookPlatform(this.config.facebook);
                    return null;
                
                default:
                    logger.error(`EngagementSystem: Unknown platform: ${platformName}`);
                    return null;
            }
        } catch (error) {
            logger.error('EngagementSystem: Error creating platform:', error);
            return null;
        }
    }

    /**
     * Start the engagement system
     */
    async start() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (!this.config.enabled) {
                logger.info('EngagementSystem: System is disabled, not starting');
                return false;
            }

            logger.info('EngagementSystem: Starting...');
            
            // Start the engagement manager
            await this.manager.start();
            
            logger.info('EngagementSystem: Started successfully');
            logger.info(`EngagementSystem: Monitoring pool ${this.config.poolId}`);
            logger.info(`EngagementSystem: Using ${this.config.platform} platform`);
            logger.info('EngagementSystem: System will check for updates every minute');
            
            return true;
        } catch (error) {
            logger.error('EngagementSystem: Error starting:', error);
            return false;
        }
    }

    /**
     * Stop the engagement system
     */
    async stop() {
        try {
            logger.info('EngagementSystem: Stopping...');
            
            await this.manager.stop();
            
            // Stop the platform (to clean up Telegram polling, etc.)
            if (this.platform && this.platform.stopBot) {
                await this.platform.stopBot();
            }
            
            this.isInitialized = false;
            
            logger.info('EngagementSystem: Stopped successfully');
            return true;
        } catch (error) {
            logger.error('EngagementSystem: Error stopping:', error);
            return false;
        }
    }

    /**
     * Switch to a different platform
     * @param {string} platformName - New platform name
     */
    async switchPlatform(platformName) {
        try {
            logger.info(`EngagementSystem: Switching to ${platformName} platform...`);
            
            // Stop current manager
            if (this.manager.isRunning) {
                await this.manager.stop();
            }

            // Create new platform
            this.platform = await this.createPlatform(platformName);
            
            if (!this.platform) {
                logger.error('EngagementSystem: Failed to create new platform');
                return false;
            }

            // Initialize new platform
            await this.platform.initialize();

            // Set new platform in manager
            this.manager.setPlatform(this.platform);

            // Start manager with new platform
            await this.manager.start();

            logger.info(`EngagementSystem: Successfully switched to ${platformName} platform`);
            return true;
        } catch (error) {
            logger.error('EngagementSystem: Error switching platform:', error);
            return false;
        }
    }

    /**
     * Get system status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isEnabled: this.config.enabled,
            platform: this.config.platform,
            poolId: this.config.poolId,
            manager: this.manager.getStatus()
        };
    }

    /**
     * Send a manual message (for testing or manual triggers)
     * @param {Object|string} message - Message to send
     */
    async sendMessage(message) {
        return await this.manager.sendMessage(message);
    }

    /**
     * Send a manual poll (for testing or manual triggers)
     * @param {Object} poll - Poll to send
     */
    async sendPoll(poll) {
        return await this.manager.sendPoll(poll);
    }
}

// Create singleton instance
const engagementSystem = new EngagementSystem();

module.exports = engagementSystem;

