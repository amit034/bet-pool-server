'use strict';

const BasePoll = require('../core/BasePoll');
const MatchQuery = require('../services/MatchQuery');
const logger = require('../../utils/logger');

/**
 * Score Prediction Poll - Interactive polls about match scores
 * Triggers for live matches with score predictions
 */
class ScorePredictionPoll extends BasePoll {
    constructor(config = {}) {
        super({
            id: 'score_prediction_poll',
            name: 'Score Prediction Poll',
            priority: 'medium',
            schedule: 'always',
            cooldown: 1800000, // 30 minutes
            ...config
        });
        
        this.poolId = config.poolId;
        this.match = null;
    }

    /**
     * Check if score prediction poll should trigger
     * @returns {Promise<boolean>} True if poll should trigger
     */
    async shouldTrigger() {
        try {
            if (this.isOnCooldown() || this.isActive) {
                return false;
            }

            // Get live matches
            const liveMatches = await MatchQuery.getLiveMatches(this.poolId);
            
            if (liveMatches.length === 0) {
                return false;
            }

            // Find a match that's suitable for score prediction
            this.match = this.selectSuitableMatch(liveMatches);
            
            return this.match !== null;
        } catch (error) {
            logger.error('ScorePredictionPoll: Error checking trigger:', error);
            return false;
        }
    }

    /**
     * Build the score prediction poll message
     * @returns {Promise<Object>} Poll message object
     */
    async buildMessage() {
        try {
            if (!this.match) {
                throw new Error('No match selected for poll');
            }

            const poll = {
                question: this.formatQuestion(this.match),
                options: this.getScoreOptions(this.match),
                validUntil: Date.now() + (15 * 60 * 1000), // 15 minutes
                metadata: {
                    type: 'score_prediction',
                    matchId: this.match.id,
                    homeTeam: this.match.homeTeam,
                    awayTeam: this.match.awayTeam,
                    currentScore: this.getCurrentScore(this.match),
                    poolId: this.poolId
                }
            };

            // Mark as triggered with 15-minute validity
            this.markTriggered(15 * 60 * 1000);

            return poll;
        } catch (error) {
            logger.error('ScorePredictionPoll: Error building message:', error);
            throw error;
        }
    }

    /**
     * Process poll results when poll closes
     * @param {Object} results - Poll response data
     */
    async onResult(results) {
        try {
            logger.info('ScorePredictionPoll: Processing results:', {
                matchId: this.match?.id,
                totalResponses: results.totalResponses,
                results: results.summary
            });

            // Store poll results for later comparison with actual match result
            // This could be used to calculate prediction accuracy
            
            // Mark poll as closed
            this.markClosed();
            
        } catch (error) {
            logger.error('ScorePredictionPoll: Error processing results:', error);
        }
    }

    /**
     * Select a suitable match for score prediction
     * @param {Array} matches - Array of live matches
     * @returns {Object|null} Selected match or null
     */
    selectSuitableMatch(matches) {
        // Find a match that's in progress but not too far along
        const suitableMatch = matches.find(match => {
            const currentScore = this.getCurrentScore(match);
            const totalGoals = currentScore.home + currentScore.away;
            
            // Select matches that are 0-0, 1-0, 0-1, or 1-1 (early in the game)
            return totalGoals <= 2;
        });

        return suitableMatch || null;
    }

    /**
     * Get current score from match
     * @param {Object} match - Match data
     * @returns {Object} Current score
     */
    getCurrentScore(match) {
        return {
            home: match.homeTeamScore || match.home_score || 0,
            away: match.awayTeamScore || match.away_score || 0
        };
    }

    /**
     * Format the poll question
     * @param {Object} match - Match data
     * @returns {string} Formatted question
     */
    formatQuestion(match) {
        const homeTeam = match.homeTeam?.name || match.homeTeamName || 'Home Team';
        const awayTeam = match.awayTeam?.name || match.awayTeamName || 'Away Team';
        const currentScore = this.getCurrentScore(match);
        
        return `Current: ${homeTeam} ${currentScore.home}-${currentScore.away} ${awayTeam}\n\nWhat will be the final score?`;
    }

    /**
     * Get score prediction options
     * @param {Object} match - Match data
     * @returns {Array} Array of score options
     */
    getScoreOptions(match) {
        const currentScore = this.getCurrentScore(match);
        const homeTeam = match.homeTeam?.name || match.homeTeamName || 'Home';
        const awayTeam = match.awayTeam?.name || match.awayTeamName || 'Away';
        
        // Generate realistic score options based on current score
        const options = [];
        
        // Home team wins
        options.push(`${homeTeam} wins (${currentScore.home + 1}-${currentScore.away})`);
        if (currentScore.home > 0) {
            options.push(`${homeTeam} wins (${currentScore.home + 2}-${currentScore.away})`);
        }
        
        // Draw
        options.push(`Draw (${currentScore.home + 1}-${currentScore.away + 1})`);
        
        // Away team wins
        options.push(`${awayTeam} wins (${currentScore.home}-${currentScore.away + 1})`);
        if (currentScore.away > 0) {
            options.push(`${awayTeam} wins (${currentScore.home}-${currentScore.away + 2})`);
        }
        
        return options.slice(0, 4); // Limit to 4 options
    }
}

module.exports = ScorePredictionPoll;

