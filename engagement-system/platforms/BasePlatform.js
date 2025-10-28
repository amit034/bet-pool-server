'use strict';

const logger = require('../../utils/logger');

/**
 * BasePlatform - Abstract base class for all social media platforms
 * 
 * All platform implementations (Telegram, WhatsApp, Instagram, Facebook)
 * must extend this class and implement the required methods.
 */
class BasePlatform {
    constructor(config = {}) {
        this.config = config;
        this.platformName = 'base';
        this.isInitialized = false;
        this.mockMode = config.mockMode || false;
    }

    /**
     * Initialize the platform
     * Must be implemented by child classes
     * @returns {Promise<boolean>}
     */
    async initialize() {
        throw new Error('initialize() must be implemented by child class');
    }

    /**
     * Send a text message
     * @param {Object} message - Message object { content: string, metadata: Object }
     * @returns {Promise<Object>} Result of sending
     */
    async sendMessage(message) {
        throw new Error('sendMessage() must be implemented by child class');
    }

    /**
     * Send a poll
     * @param {Object} poll - Poll object { question: string, options: Array, metadata: Object }
     * @returns {Promise<Object>} Result of sending
     */
    async sendPoll(poll) {
        throw new Error('sendPoll() must be implemented by child class');
    }

    /**
     * Send an image with caption
     * @param {Object} image - Image object { url: string, caption: string, metadata: Object }
     * @returns {Promise<Object>} Result of sending
     */
    async sendImage(image) {
        throw new Error('sendImage() must be implemented by child class');
    }

    /**
     * Check if platform is available and configured
     * @returns {boolean}
     */
    isAvailable() {
        return this.isInitialized && !this.mockMode;
    }

    /**
     * Get platform name
     * @returns {string}
     */
    getPlatformName() {
        return this.platformName;
    }

    /**
     * Check if in mock mode
     * @returns {boolean}
     */
    isMockMode() {
        return this.mockMode;
    }

    /**
     * Validate message format
     * @param {Object} message
     * @returns {boolean}
     */
    validateMessage(message) {
        if (!message) {
            logger.error(`${this.platformName}: Message is required`);
            return false;
        }

        if (typeof message === 'string') {
            return true;
        }

        if (!message.content && !message.text) {
            logger.error(`${this.platformName}: Message content is required`);
            return false;
        }

        return true;
    }

    /**
     * Validate poll format
     * @param {Object} poll
     * @returns {boolean}
     */
    validatePoll(poll) {
        if (!poll) {
            logger.error(`${this.platformName}: Poll is required`);
            return false;
        }

        if (!poll.question) {
            logger.error(`${this.platformName}: Poll question is required`);
            return false;
        }

        if (!poll.options || !Array.isArray(poll.options) || poll.options.length < 2) {
            logger.error(`${this.platformName}: Poll must have at least 2 options`);
            return false;
        }

        return true;
    }

    /**
     * Extract message content from various formats
     * @param {Object|string} message
     * @returns {string}
     */
    extractContent(message) {
        if (typeof message === 'string') {
            return message;
        }

        return message.content || message.text || '';
    }

    /**
     * Log message sending
     * @param {string} type - Message type (message, poll, image)
     * @param {Object} data - Message data
     */
    logSending(type, data) {
        logger.info(`${this.platformName}: Sending ${type}`, {
            platform: this.platformName,
            type: type,
            mockMode: this.mockMode
        });
    }

    /**
     * Log message sent successfully
     * @param {string} type - Message type
     * @param {Object} result - Send result
     */
    logSuccess(type, result) {
        logger.info(`${this.platformName}: ${type} sent successfully`, {
            platform: this.platformName,
            type: type,
            mockMode: this.mockMode
        });
    }

    /**
     * Log error
     * @param {string} operation - Operation name
     * @param {Error} error - Error object
     */
    logError(operation, error) {
        logger.error(`${this.platformName}: Error in ${operation}:`, error);
    }
}

module.exports = BasePlatform;





