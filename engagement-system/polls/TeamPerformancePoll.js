
'use strict';

const BasePoll = require('../core/BasePoll');
const MatchQuery = require('../services/MatchQuery');
const logger = require('../../utils/logger');

/**
 * Team Performance Poll - Interactive polls about team performance
 * Triggers for teams with interesting recent performance
 */
class TeamPerformancePoll extends BasePoll {
    constructor(config = {}) {
        super({
            id: 'team_performance_poll',
            name: 'Team Performance Prediction',
            priority: 'medium',
            schedule: 'always',
            cooldown: 7200000, // 2 hours
            ...config
        });
        
        this.poolId = config.poolId;
        this.team = null;
    }

    /**
     * Check if team performance poll should trigger
     * @returns {Promise<boolean>} True if poll should trigger
     */
    async shouldTrigger() {
        try {
            if (this.isOnCooldown() || this.isActive) {
                return false;
            }

            // Find a team with interesting recent performance
            this.team = await this.findInterestingTeam();
            
            return this.team !== null;
        } catch (error) {
            logger.error('TeamPerformancePoll: Error checking trigger:', error);
            return false;
        }
    }

    /**
     * Build the team performance poll message
     * @returns {Promise<Object>} Poll message object
     */
    async buildMessage() {
        try {
            if (!this.team) {
                throw new Error('No team selected for poll');
            }

            const poll = {
                question: this.formatQuestion(this.team),
                options: this.getPerformanceOptions(this.team),
                validUntil: Date.now() + (20 * 60 * 1000), // 20 minutes
                metadata: {
                    type: 'team_performance',
                    teamId: this.team.id,
                    teamName: this.team.name,
                    poolId: this.poolId
                }
            };

            // Mark as triggered with 20-minute validity
            this.markTriggered(20 * 60 * 1000);

            return poll;
        } catch (error) {
            logger.error('TeamPerformancePoll: Error building message:', error);
            throw error;
        }
    }

    /**
     * Process poll results when poll closes
     * @param {Object} results - Poll response data
     */
    async onResult(results) {
        try {
            logger.info('TeamPerformancePoll: Processing results:', {
                teamId: this.team?.id,
                totalResponses: results.totalResponses,
                results: results.summary
            });

            // Store poll results for analytics
            // This could be used to track user predictions vs actual performance
            
            // Mark poll as closed
            this.markClosed();
            
        } catch (error) {
            logger.error('TeamPerformancePoll: Error processing results:', error);
        }
    }

    /**
     * Find a team with interesting recent performance
     * @returns {Promise<Object|null>} Interesting team or null
     */
    async findInterestingTeam() {
        try {
            // This would query your existing database models
            // Look for teams with interesting recent performance:
            // - Teams on winning streaks
            // - Teams with high-scoring games
            // - Teams with surprising results
            
            // Placeholder implementation
            const interestingTeam = null;
            
            logger.debug(`TeamPerformancePoll: Found interesting team: ${interestingTeam?.name || 'none'}`);
            return interestingTeam;
        } catch (error) {
            logger.error('TeamPerformancePoll: Error finding interesting team:', error);
            return null;
        }
    }

    /**
     * Format the poll question
     * @param {Object} team - Team data
     * @returns {string} Formatted question
     */
    formatQuestion(team) {
        const teamName = team.name || 'This team';
        
        return `How do you think ${teamName} will perform in their next match?`;
    }

    /**
     * Get performance prediction options
     * @param {Object} team - Team data
     * @returns {Array} Array of performance options
     */
    getPerformanceOptions(team) {
        return [
            '🔥 Excellent (3+ goals)',
            '⚽ Good (2 goals)',
            '😐 Average (1 goal)',
            '😔 Poor (0 goals)'
        ];
    }
}

module.exports = TeamPerformancePoll;

