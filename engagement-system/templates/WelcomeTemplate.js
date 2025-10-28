'use strict';

const TemplateHelper = require('./TemplateHelper');

/**
 * Welcome Users Template
 * Handles welcome messages for new users
 */
class WelcomeTemplate {
    /**
     * Build welcome message
     * @param {Array} users - Array of user objects
     * @param {string} locale - Locale code
     * @returns {string} Formatted message
     */
    static build(users, locale = 'he') {
        if (!users || users.length === 0) {
            return '';
        }

        const sections = [];

        if (users.length === 1) {
            // Single user welcome
            const user = users[0];
            const displayName = user.firstName 
                ? `${user.firstName} ${user.lastName || ''}`.trim() 
                : user.username;

            const title = TemplateHelper.getInterpolatedText(
                locale,
                'welcome.singleTitle',
                { displayName }
            );
            sections.push(title);

            const excitement = TemplateHelper.getText(locale, 'welcome.excitement');
            sections.push(excitement);
        } else {
            // Multiple users welcome
            const usernames = users.map(user => 
                user.firstName 
                    ? `${user.firstName} ${user.lastName || ''}`.trim() 
                    : user.username
            ).join(', ');

            const title = TemplateHelper.getInterpolatedText(
                locale,
                'welcome.multipleTitle',
                { usernames }
            );
            sections.push(title);

            const excitement = TemplateHelper.getText(locale, 'welcome.excitementPlural');
            sections.push(excitement);
        }

        // Footer
        const footer = TemplateHelper.getText(locale, 'welcome.footer');
        if (footer) {
            sections.push(footer);
        }

        return TemplateHelper.buildMessage(sections);
    }
}

module.exports = WelcomeTemplate;




