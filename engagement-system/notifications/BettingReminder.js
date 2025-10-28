'use strict';

const UpcomingGames = require('./UpcomingGames');
const { ReminderTemplate } = require('../templates');

/**
 * Betting Reminder - Reminds users to place their bets on upcoming games
 * Extends UpcomingGames with different configuration for reminder context
 */
class BettingReminder extends UpcomingGames {
    constructor(config = {}) {
        super({
            id: 'betting_reminder',
            name: 'Betting Reminder',
            priority: 'medium',
            schedule: 'daily',
            cooldown: 86400000, // 24 hours (longer than upcoming games)
            timeFilter: 'day', // Focus on today's games
            messageType: 'reminder',
            messageSource: 'Betting Reminder',
            template: ReminderTemplate,
            logPrefix: 'BettingReminder',
            notificationStartHour: 9,  // Start later (9 AM)
            notificationEndHour: 22,    // End earlier (10 PM)
            ...config
        });
    }

    // That's it! All behavior configured through properties.
    // The parent class handles all the logic using these properties.
}

module.exports = BettingReminder;




