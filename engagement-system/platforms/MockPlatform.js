'use strict';

const BasePlatform = require('./BasePlatform');
const logger = require('../../utils/logger');

/**
 * MockPlatform - Testing/Development platform
 * 
 * This platform logs all messages to console instead of sending them
 * to a real social media platform. Perfect for testing and development!
 * 
 * Usage:
 *   ENGAGEMENT_PLATFORM=mock
 */
class MockPlatform extends BasePlatform {
    constructor(config = {}) {
        super(config);
        this.platformName = 'mock';
        this.sentMessages = [];
        this.sentPolls = [];
        this.sentImages = [];
    }

    /**
     * Initialize mock platform (always succeeds)
     */
    async initialize() {
        this.isInitialized = true;
        logger.info('MockPlatform: Initialized successfully');
        console.log('\n' + '='.repeat(70));
        console.log('🧪 MOCK PLATFORM INITIALIZED');
        console.log('='.repeat(70));
        console.log('All messages will be logged to console instead of being sent');
        console.log('Perfect for testing and development!');
        console.log('='.repeat(70) + '\n');
        return true;
    }

    /**
     * Send mock message
     */
    async sendMessage(message) {
        try {
            if (!this.validateMessage(message)) {
                throw new Error('Invalid message format');
            }

            const content = this.extractContent(message);
            const timestamp = new Date().toISOString();
            
            // Store message
            this.sentMessages.push({
                content,
                timestamp,
                metadata: message.metadata || {}
            });

            // Log to console
            console.log('\n' + '='.repeat(70));
            console.log('📱 MOCK MESSAGE');
            console.log('='.repeat(70));
            console.log('Platform: Mock');
            console.log('Time:', timestamp);
            console.log('Type:', message.type || 'message');
            if (message.metadata) {
                console.log('Source:', message.metadata.source || 'N/A');
            }
            console.log('-'.repeat(70));
            console.log(content);
            console.log('='.repeat(70) + '\n');

            this.logSuccess('message', { content });
            
            return { 
                success: true, 
                platform: 'mock', 
                messageId: this.sentMessages.length,
                timestamp 
            };

        } catch (error) {
            this.logError('sendMessage', error);
            throw error;
        }
    }

    /**
     * Send mock poll
     */
    async sendPoll(poll) {
        try {
            if (!this.validatePoll(poll)) {
                throw new Error('Invalid poll format');
            }

            const timestamp = new Date().toISOString();
            
            // Store poll
            this.sentPolls.push({
                question: poll.question,
                options: poll.options,
                timestamp,
                metadata: poll.metadata || {}
            });

            // Log to console
            console.log('\n' + '='.repeat(70));
            console.log('🗳️  MOCK POLL');
            console.log('='.repeat(70));
            console.log('Platform: Mock');
            console.log('Time:', timestamp);
            if (poll.metadata) {
                console.log('Type:', poll.metadata.type || 'N/A');
            }
            console.log('-'.repeat(70));
            console.log('Question:', poll.question);
            console.log('\nOptions:');
            poll.options.forEach((option, index) => {
                console.log(`  ${index + 1}. ${option}`);
            });
            console.log('='.repeat(70) + '\n');

            this.logSuccess('poll', poll);
            
            return { 
                success: true, 
                platform: 'mock', 
                pollId: this.sentPolls.length,
                timestamp 
            };

        } catch (error) {
            this.logError('sendPoll', error);
            throw error;
        }
    }

    /**
     * Send mock image
     */
    async sendImage(image) {
        try {
            if (!image || !image.url) {
                throw new Error('Image URL is required');
            }

            const timestamp = new Date().toISOString();
            
            // Store image
            this.sentImages.push({
                url: image.url,
                caption: image.caption || '',
                timestamp,
                metadata: image.metadata || {}
            });

            // Log to console
            console.log('\n' + '='.repeat(70));
            console.log('🖼️  MOCK IMAGE');
            console.log('='.repeat(70));
            console.log('Platform: Mock');
            console.log('Time:', timestamp);
            console.log('-'.repeat(70));
            console.log('URL:', image.url);
            console.log('Caption:', image.caption || '(none)');
            console.log('='.repeat(70) + '\n');

            this.logSuccess('image', image);
            
            return { 
                success: true, 
                platform: 'mock', 
                imageId: this.sentImages.length,
                timestamp 
            };

        } catch (error) {
            this.logError('sendImage', error);
            throw error;
        }
    }

    /**
     * Get statistics about sent messages
     */
    getStats() {
        return {
            platform: 'mock',
            totalMessages: this.sentMessages.length,
            totalPolls: this.sentPolls.length,
            totalImages: this.sentImages.length,
            messages: this.sentMessages,
            polls: this.sentPolls,
            images: this.sentImages
        };
    }

    /**
     * Clear all sent messages (useful for testing)
     */
    clear() {
        this.sentMessages = [];
        this.sentPolls = [];
        this.sentImages = [];
        console.log('🧹 MockPlatform: Cleared all messages');
    }

    /**
     * Print summary of all sent messages
     */
    printSummary() {
        console.log('\n' + '='.repeat(70));
        console.log('📊 MOCK PLATFORM SUMMARY');
        console.log('='.repeat(70));
        console.log(`Total Messages: ${this.sentMessages.length}`);
        console.log(`Total Polls: ${this.sentPolls.length}`);
        console.log(`Total Images: ${this.sentImages.length}`);
        console.log('='.repeat(70) + '\n');
    }

    /**
     * Mock platform is always available
     */
    isAvailable() {
        return true;
    }

    /**
     * Mock platform is never actually in mock mode
     * (it IS the mock!)
     */
    isMockMode() {
        return false;  // This IS the real mock platform
    }
}

module.exports = MockPlatform;





