'use strict';

const BaseEngagementModule = require('../core/BaseEngagementModule');
const poolUtils = require('../../utils/poolUtils');
const logger = require('../../utils/logger');
const { BiggestJumpTemplate } = require('../templates');

/**
 * Round Biggest Jump Insight - Celebrates biggest jump in the current/last round
 */
class RoundBiggestJumpInsight extends BaseEngagementModule {
    constructor(config = {}) {
        super({
            type: 'insight',
            id: 'round_biggest_jump',
            name: 'Round Biggest Jump',
            cooldown: 43200000, // 12 hours
            priority: 'high',
            schedule: 'daily',
            ...config // User config overrides defaults
        });
        
        this.poolId = config.poolId;
        this.granularity = config.granularity || 'round';
        this.minJump = config.minJump || 5;
        this.locale = config.locale || 'he';
        
        // Configuration attributes for polymorphic behavior
        this.granularityDescription = config.granularityDescription || 'round jump';
        this.recordType = config.recordType || 'round';
        this.isAllTimeBestRecord = config.isAllTimeBestRecord || false;
    }

    /**
     * Check if biggest jump insight should trigger
     * @returns {Promise<boolean>} True if insight should trigger
     */
    async shouldTrigger() {
        try {
            if (this.isOnCooldown()) {
                logger.debug(`${this.name}: On cooldown, skipping trigger check`);
                return false;
            }

            // Check if the current round is complete
            const roundStatus = await poolUtils.getCurrentRoundStatus(this.poolId);
            logger.debug(`${this.name}: Round ${roundStatus.currentRound} status - Complete: ${roundStatus.isRoundComplete}, Games: ${roundStatus.finishedGames}/${roundStatus.currentRoundGames}`);
            
            if (!roundStatus.isRoundComplete) {
                logger.debug(`${this.name}: Round ${roundStatus.currentRound} not complete yet, waiting...`);
                return false;
            }
            
            logger.info(`${this.name}: ✅ Round ${roundStatus.currentRound} is complete! Checking for ${this.granularityDescription}...`);

            // Get biggest jump
            const winner = await poolUtils.getBiggestJump(this.poolId, this.granularity);
            
            if (!winner || !winner.jump || winner.jump <= 0) {
                logger.debug(`${this.name}: No jump data found, conditions not met`);
                return false;
            }

            const jumpScore = winner.jump;
            logger.debug(`${this.name}: Found jump of ${jumpScore} points (min: ${this.minJump})`);
            
            if (jumpScore >= this.minJump) {
                logger.info(`${this.name}: ✅ CONDITIONS MET - ${winner.username} achieved ${this.recordType} jump of ${jumpScore} points! CANDIDATE FOR MESSAGE`);
                return true;
            } else {
                logger.debug(`${this.name}: Jump of ${jumpScore} is below minimum ${this.minJump}, conditions not met`);
                return false;
            }
        } catch (error) {
            logger.error(`${this.name}: Error checking trigger:`, error);
            return false;
        }
    }

    /**
     * Build the biggest jump message
     * @returns {Promise<Object>} Message object
     */
    async buildMessage() {
        try {
            const winner = await poolUtils.getBiggestJump(this.poolId, this.granularity);
            
            if (!winner || !winner.jump || winner.jump <= 0) {
                throw new Error('No biggest jump found');
            }

            const message = {
                type: 'achievement',
                content: this.formatJumpMessage(winner),
                metadata: {
                    source: this.name,
                    userId: winner.userId,
                    biggestJump: winner.jump,
                    granularity: this.granularity,
                    roundId: winner.roundId,
                    poolId: this.poolId,
                    isAllTimeBest: this.isAllTimeBestRecord
                }
            };

            return message;
        } catch (error) {
            logger.error(`${this.name}: Error building message:`, error);
            throw error;
        }
    }

    /**
     * Format the jump message using templates
     * @param {Object} winner - Jump data
     * @returns {string} Formatted message
     */
    formatJumpMessage(winner) {
        return BiggestJumpTemplate.build(winner, this.granularity, this.locale);
    }
}

module.exports = RoundBiggestJumpInsight;
