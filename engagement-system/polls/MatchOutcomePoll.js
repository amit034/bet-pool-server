'use strict';

const BasePoll = require('../core/BasePoll');
const MatchQuery = require('../services/MatchQuery');
const logger = require('../../utils/logger');

/**
 * Match Outcome Poll - Interactive polls about match predictions
 * Triggers before important matches
 */
class MatchOutcomePoll extends BasePoll {
    constructor(config = {}) {
        super({
            id: 'match_outcome_poll',
            name: 'Match Outcome Prediction',
            priority: 'high',
            schedule: 'match_days',
            cooldown: 7200000, // 2 hours
            ...config
        });
        
        this.poolId = config.poolId;
        this.matchId = config.matchId;
        this.match = null;
    }

    /**
     * Check if match outcome poll should trigger
     * @returns {Promise<boolean>} True if poll should trigger
     */
    async shouldTrigger() {
        try {
            if (this.isOnCooldown() || this.isActive) {
                return false;
            }

            // Get upcoming matches
            const upcomingMatches = await MatchQuery.getUpcomingMatches(this.poolId, 2); // Next 2 hours
            
            if (upcomingMatches.length === 0) {
                return false;
            }

            // Find the most important match (you can define importance criteria)
            this.match = this.selectImportantMatch(upcomingMatches);
            
            return this.match !== null;
        } catch (error) {
            logger.error('MatchOutcomePoll: Error checking trigger:', error);
            return false;
        }
    }

    /**
     * Build the match outcome poll message
     * @returns {Promise<Object>} Poll message object
     */
    async buildMessage() {
        try {
            if (!this.match) {
                throw new Error('No match selected for poll');
            }

            const poll = {
                question: this.formatQuestion(this.match),
                options: this.getPollOptions(this.match),
                validUntil: Date.now() + (30 * 60 * 1000), // 30 minutes
                metadata: {
                    type: 'match_outcome',
                    matchId: this.match.id,
                    homeTeam: this.match.homeTeam,
                    awayTeam: this.match.awayTeam,
                    poolId: this.poolId
                }
            };

            // Mark as triggered with 30-minute validity
            this.markTriggered(30 * 60 * 1000);

            return poll;
        } catch (error) {
            logger.error('MatchOutcomePoll: Error building message:', error);
            throw error;
        }
    }

    /**
     * Process poll results when poll closes
     * @param {Object} results - Poll response data
     */
    async onResult(results) {
        try {
            logger.info('MatchOutcomePoll: Processing results:', {
                matchId: this.match?.id,
                totalResponses: results.totalResponses,
                results: results.summary
            });

            // You can store poll results in your database
            // This could be used for analytics or to compare with actual match results
            
            // Mark poll as closed
            this.markClosed();
            
        } catch (error) {
            logger.error('MatchOutcomePoll: Error processing results:', error);
        }
    }

    /**
     * Select the most important match for polling
     * @param {Array} matches - Array of upcoming matches
     * @returns {Object|null} Selected match or null
     */
    selectImportantMatch(matches) {
        // Simple selection logic - you can make this more sophisticated
        // For example, prioritize matches with more participants, higher stakes, etc.
        
        if (matches.length === 0) {
            return null;
        }

        // For now, select the first match
        // You could implement more sophisticated selection based on:
        // - Number of participants
        // - Match importance (Champions League vs regular league)
        // - Time until match starts
        // - Historical engagement with similar matches
        
        return matches[0];
    }

    /**
     * Format the poll question
     * @param {Object} match - Match data
     * @returns {string} Formatted question
     */
    formatQuestion(match) {
        const homeTeam = match.homeTeam?.name || match.homeTeamName || 'Home Team';
        const awayTeam = match.awayTeam?.name || match.awayTeamName || 'Away Team';
        
        return `Who will win: ${homeTeam} vs ${awayTeam}?`;
    }

    /**
     * Get poll options based on match
     * @param {Object} match - Match data
     * @returns {Array} Array of poll options
     */
    getPollOptions(match) {
        const homeTeam = match.homeTeam?.name || match.homeTeamName || 'Home Team';
        const awayTeam = match.awayTeam?.name || match.awayTeamName || 'Away Team';
        
        return [
            homeTeam,
            'Draw',
            awayTeam
        ];
    }
}

module.exports = MatchOutcomePoll;

