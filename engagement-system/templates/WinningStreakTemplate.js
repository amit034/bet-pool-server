'use strict';

const TemplateHelper = require('./TemplateHelper');

/**
 * Winning Streak Template
 * Handles winning streak messages
 */
class WinningStreakTemplate {
    /**
     * Build winning streak message
     * @param {Object} data - Streak data
     * @param {string} locale - Locale code
     * @returns {string} Formatted message
     */
    static build(data, locale = 'he') {
        const {
            username,
            firstName,
            lastName,
            streakLength
        } = data;

        // Determine display name
        const displayName = firstName 
            ? `${firstName} ${lastName || ''}`.trim() 
            : username;

        const sections = [];

        // Title
        const title = TemplateHelper.getInterpolatedText(
            locale,
            'winningStreak.title',
            { displayName, streakLength }
        );
        sections.push(title);

        // Description
        const description = TemplateHelper.getInterpolatedText(
            locale,
            'winningStreak.description',
            { streakLength }
        );
        sections.push(description);

        // Encouragement
        const encouragementLevel = this.selectEncouragementLevel(streakLength);
        const encouragement = TemplateHelper.getText(
            locale,
            `winningStreak.encouragement.${encouragementLevel}`
        );
        if (encouragement) {
            sections.push(encouragement);
        }

        // Footer
        const footer = TemplateHelper.getText(locale, 'winningStreak.footer');
        if (footer) {
            sections.push(footer);
        }

        return TemplateHelper.buildMessage(sections);
    }

    /**
     * Select encouragement level based on streak length
     * @param {number} streakLength - Streak length
     * @returns {string} Encouragement level
     */
    static selectEncouragementLevel(streakLength) {
        if (streakLength >= 5) return 'legendary';
        if (streakLength >= 3) return 'amazing';
        return 'great';
    }
}

module.exports = WinningStreakTemplate;




