'use strict';

const schedule = require('node-schedule');
const logger = require('../utils/logger');

/**
 * WhatsApp Engagement Job
 * Runs the Group Engagement Manager every minute to process insights and polls
 */
class WhatsAppEngagementJob {
    constructor() {
        this.isRunning = false;
        this.job = null;
        this.system = null;
    }

    /**
     * Start the WhatsApp engagement job
     */
    async start() {
        if (this.isRunning) {
            logger.info('WhatsAppEngagementJob: Already running');
            return;
        }

        try {
            logger.info('WhatsAppEngagementJob: Initializing WhatsApp engagement system...');
            
            // Import and initialize the WhatsApp engagement system
            const { initializeWhatsAppEngagement, GroupEngagementManager } = require('../whatsapp-engagement');
            await initializeWhatsAppEngagement();
            this.system = new GroupEngagementManager();
            
            this.isRunning = true;
            logger.info('WhatsAppEngagementJob: Starting WhatsApp engagement job (every 1 minute)');
            
            // Schedule job to run every minute using node-schedule
            this.job = schedule.scheduleJob('* * * * *', async () => {
                await this.run();
            });
            
            // Run immediately on start
            await this.run();
            
        } catch (error) {
            logger.error('WhatsAppEngagementJob: Failed to initialize WhatsApp engagement system:', error);
            throw error;
        }
    }

    /**
     * Stop the WhatsApp engagement job
     */
    stop() {
        if (!this.isRunning) {
            logger.info('WhatsAppEngagementJob: Not running');
            return;
        }

        this.isRunning = false;
        if (this.job) {
            this.job.cancel();
            this.job = null;
        }
        logger.info('WhatsAppEngagementJob: Stopped');
    }

    /**
     * Run the engagement cycle
     */
    async run() {
        try {
            if (!this.isRunning) {
                logger.debug('WhatsAppEngagementJob: Not running, skipping cycle');
                return;
            }

            logger.debug('WhatsAppEngagementJob: Running engagement cycle...');
            console.log('WhatsAppEngagementJob: About to call system.run()');
            await this.system.run();
            console.log('WhatsAppEngagementJob: system.run() completed');
            logger.debug('WhatsAppEngagementJob: Engagement cycle completed');
        } catch (error) {
            console.error('WhatsAppEngagementJob: Error in engagement cycle:', error);
            console.error('WhatsAppEngagementJob: Error stack:', error.stack);
            logger.error('WhatsAppEngagementJob: Error in engagement cycle:', error);
        }
    }

    /**
     * Get job status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            hasJob: !!this.job,
            nextRun: this.job ? this.job.nextInvocation() : null
        };
    }
}

// Create singleton instance
const whatsappEngagementJob = new WhatsAppEngagementJob();

module.exports = whatsappEngagementJob;
