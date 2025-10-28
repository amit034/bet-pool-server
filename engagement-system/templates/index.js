'use strict';

/**
 * Templates Index
 * Central export for all templates and template utilities
 */

const TemplateHelper = require('./TemplateHelper');
const { getLocale, getAvailableLocales } = require('./locales');

// Template classes
const BiggestJumpTemplate = require('./BiggestJumpTemplate');
const WinningStreakTemplate = require('./WinningStreakTemplate');
const WelcomeTemplate = require('./WelcomeTemplate');
const UpcomingGamesTemplate = require('./UpcomingGamesTemplate');
const ReminderTemplate = require('./ReminderTemplate');

module.exports = {
    // Helper utilities
    TemplateHelper,
    getLocale,
    getAvailableLocales,

    // Template classes
    BiggestJumpTemplate,
    WinningStreakTemplate,
    WelcomeTemplate,
    UpcomingGamesTemplate,
    ReminderTemplate
};




