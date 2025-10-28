'use strict';

const BasePlatform = require('./BasePlatform');
const logger = require('../../utils/logger');

/**
 * WhatsAppPlatform - WhatsApp Business API implementation
 * Handles all WhatsApp-specific communication
 */
class WhatsAppPlatform extends BasePlatform {
    constructor(config = {}) {
        super(config);
        this.platformName = 'whatsapp';
        
        this.apiUrl = config.apiUrl || process.env.WHATSAPP_API_URL;
        this.accessToken = config.accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
        this.phoneNumberId = config.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
        this.groupId = config.groupId || process.env.WHATSAPP_GROUP_ID;
    }

    /**
     * Initialize WhatsApp Business API
     */
    async initialize() {
        try {
            if (!this.accessToken || !this.phoneNumberId) {
                throw new Error('Missing API credentials. Use MockPlatform for testing.');
            }

            this.isInitialized = true;
            logger.info('WhatsAppPlatform: Initialized successfully');
            logger.warn('WhatsAppPlatform: Note - WhatsApp Business API can only send to individual users, not groups');
            
            return true;
        } catch (error) {
            logger.error('WhatsAppPlatform: Error initializing:', error);
            throw error;
        }
    }

    /**
     * Send text message via WhatsApp Business API
     * Note: WhatsApp Business API can only send to individual users, not groups
     */
    async sendMessage(message) {
        try {
            if (!this.validateMessage(message)) {
                throw new Error('Invalid message format');
            }

            const content = this.extractContent(message);
            this.logSending('message', { content });

            // WhatsApp Business API limitation: Can only send to individual users
            // This would need to iterate through participants
            logger.warn('WhatsAppPlatform: WhatsApp Business API cannot send to groups directly');
            throw new Error('WhatsApp Business API does not support group messages. Send to individual users instead.');

        } catch (error) {
            this.logError('sendMessage', error);
            throw error;
        }
    }

    /**
     * Send poll via WhatsApp
     * Note: WhatsApp Business API does not support native polls
     */
    async sendPoll(poll) {
        try {
            if (!this.validatePoll(poll)) {
                throw new Error('Invalid poll format');
            }

            this.logSending('poll', poll);

            // WhatsApp Business API limitation: No native poll support
            logger.warn('WhatsAppPlatform: WhatsApp Business API does not support native polls');
            throw new Error('WhatsApp Business API does not support native polls. Use interactive messages instead.');

        } catch (error) {
            this.logError('sendPoll', error);
            throw error;
        }
    }

    /**
     * Send image with caption
     */
    async sendImage(image) {
        try {
            if (!image || !image.url) {
                throw new Error('Image URL is required');
            }

            this.logSending('image', image);

            // Would implement actual WhatsApp Business API call here
            logger.warn('WhatsAppPlatform: Image sending not fully implemented');
            throw new Error('WhatsApp image sending not implemented yet');

        } catch (error) {
            this.logError('sendImage', error);
            throw error;
        }
    }
}

module.exports = WhatsAppPlatform;

