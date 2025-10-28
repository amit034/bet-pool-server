'use strict';

const TemplateHelper = require('./TemplateHelper');

/**
 * Reminder Template
 * Handles bet reminder notification messages
 */
class ReminderTemplate {
    /**
     * Build reminder message
     * @param {Object} stats - Game statistics
     * @param {string} timeFilter - 'all' or 'day'
     * @param {string} gameList - Formatted game list
     * @param {string} locale - Locale code
     * @returns {string} Formatted message
     */
    static build(stats, timeFilter, gameList, locale = 'he') {
        const { totalGames } = stats;

        const sections = [];

        // Title
        const title = TemplateHelper.getText(locale, 'reminder.title');
        sections.push(title);

        // Total games count
        const totalGamesKey = timeFilter === 'day' 
            ? 'reminder.totalGamesToday'
            : 'reminder.totalGamesAll';
        
        const totalGamesText = TemplateHelper.getInterpolatedText(
            locale,
            totalGamesKey,
            { count: totalGames }
        );
        sections.push(totalGamesText);

        // Main games header
        const header = TemplateHelper.getText(locale, 'reminder.mainGamesHeader');
        sections.push(header);

        // Game list
        if (gameList) {
            sections.push(gameList);
        }

        // Footer
        const footer = TemplateHelper.getText(locale, 'reminder.footer');
        if (footer) {
            sections.push(footer);
        }

        // Factor note
        const factorNote = TemplateHelper.getText(locale, 'reminder.factorNote');
        if (factorNote) {
            sections.push(factorNote);
        }

        return TemplateHelper.buildMessage(sections);
    }
}

module.exports = ReminderTemplate;

