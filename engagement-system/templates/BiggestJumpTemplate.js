'use strict';

const TemplateHelper = require('./TemplateHelper');

/**
 * Biggest Jump Template
 * Handles both round and pool biggest jump messages
 */
class BiggestJumpTemplate {
    /**
     * Build biggest jump message
     * @param {Object} data - Jump data
     * @param {string} granularity - 'round' or 'pool'
     * @param {string} locale - Locale code
     * @returns {string} Formatted message
     */
    static build(data, granularity = 'round', locale = 'he') {
        const {
            username,
            firstName,
            lastName,
            jump,
            fromScore,
            toScore,
            roundId,
            medals = { 1: 0, 2: 0, 3: 0 }
        } = data;

        // Determine display name
        const displayName = firstName 
            ? `${firstName} ${lastName || ''}`.trim() 
            : username;

        // Select template based on granularity
        const templateKey = granularity === 'pool' ? 'poolBiggestJump' : 'roundBiggestJump';

        const sections = [];

        // Title
        const title = TemplateHelper.getInterpolatedText(
            locale,
            `${templateKey}.title`,
            { displayName }
        );
        sections.push(title);

        // Jump description (for round) or best ever (for pool)
        if (granularity === 'pool') {
            const bestEver = TemplateHelper.getInterpolatedText(
                locale,
                `${templateKey}.bestEver`,
                { jumpScore: jump }
            );
            sections.push(bestEver);

            if (roundId !== undefined) {
                const roundInfo = TemplateHelper.getInterpolatedText(
                    locale,
                    `${templateKey}.roundInfo`,
                    { fromRound: roundId, toRound: roundId + 1 }
                );
                sections.push(roundInfo);
            }
        } else {
            if (roundId !== undefined) {
                const jumpDesc = TemplateHelper.getInterpolatedText(
                    locale,
                    `${templateKey}.jumpDescription`,
                    { jumpScore: jump, fromRound: roundId, toRound: roundId + 1 }
                );
                sections.push(jumpDesc);
            } else {
                const noDetails = TemplateHelper.getInterpolatedText(
                    locale,
                    `${templateKey}.noDetails`,
                    { jumpScore: jump }
                );
                sections.push(noDetails);
            }
        }

        // Score change
        if (fromScore !== undefined && toScore !== undefined) {
            const scoreChange = TemplateHelper.getInterpolatedText(
                locale,
                `${templateKey}.scoreChange`,
                { fromScore, toScore }
            );
            sections.push(scoreChange);
        }

        // Encouragement
        const encouragementLevel = this.selectEncouragementLevel(jump, granularity);
        const encouragement = TemplateHelper.getText(
            locale,
            `${templateKey}.encouragement.${encouragementLevel}`
        );
        if (encouragement) {
            sections.push(encouragement);
        }

        // Footer
        const footer = TemplateHelper.getText(locale, `${templateKey}.footer`);
        if (footer) {
            sections.push(footer);
        }

        return TemplateHelper.buildMessage(sections);
    }

    /**
     * Select encouragement level based on jump score and granularity
     * @param {number} jump - Jump score
     * @param {string} granularity - 'round' or 'pool'
     * @returns {string} Encouragement level
     */
    static selectEncouragementLevel(jump, granularity) {
        if (granularity === 'pool') {
            // Pool-level (all-time best) thresholds
            if (jump >= 150) return 'legendary';
            if (jump >= 100) return 'amazing';
            return 'great';
        } else {
            // Round-level thresholds
            if (jump >= 100) return 'huge';
            if (jump >= 50) return 'great';
            return 'good';
        }
    }

    /**
     * Build round biggest jump message
     * @param {Object} data - Jump data
     * @param {string} locale - Locale code
     * @returns {string} Formatted message
     */
    static buildRound(data, locale = 'he') {
        return this.build(data, 'round', locale);
    }

    /**
     * Build pool biggest jump message
     * @param {Object} data - Jump data
     * @param {string} locale - Locale code
     * @returns {string} Formatted message
     */
    static buildPool(data, locale = 'he') {
        return this.build(data, 'pool', locale);
    }
}

module.exports = BiggestJumpTemplate;




