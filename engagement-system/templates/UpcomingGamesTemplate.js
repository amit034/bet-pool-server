'use strict';

const TemplateHelper = require('./TemplateHelper');

/**
 * Upcoming Games Template
 * Handles upcoming games notification messages
 */
class UpcomingGamesTemplate {
    /**
     * Build upcoming games message
     * @param {Object} stats - Game statistics
     * @param {string} timeFilter - 'all' or 'day'
     * @param {string} gameList - Formatted game list
     * @param {string} locale - Locale code
     * @returns {string} Formatted message
     */
    static build(stats, timeFilter, gameList, locale = 'he') {
        const { totalGames, mainGamesList } = stats;

        const sections = [];

        // Title
        const title = TemplateHelper.getText(locale, 'upcomingGames.title');
        sections.push(title);

        // Total games count
        const totalGamesKey = timeFilter === 'day' 
            ? 'upcomingGames.totalGamesToday'
            : 'upcomingGames.totalGamesAll';
        
        const totalGamesText = TemplateHelper.getInterpolatedText(
            locale,
            totalGamesKey,
            { count: totalGames }
        );
        sections.push(totalGamesText);

        // Main games header
        const header = TemplateHelper.getText(locale, 'upcomingGames.mainGamesHeader');
        sections.push(header);

        // Game list
        if (gameList) {
            sections.push(gameList);
        } else {
            const noGames = TemplateHelper.getText(locale, 'upcomingGames.noGames');
            sections.push(noGames);
        }

        // Footer
        const footer = TemplateHelper.getText(locale, 'upcomingGames.footer');
        if (footer) {
            sections.push(footer);
        }

        return TemplateHelper.buildMessage(sections);
    }
}

module.exports = UpcomingGamesTemplate;

