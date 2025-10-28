'use strict';

const BaseLoader = require('../core/BaseLoader');
const BaseRegistry = require('../core/BaseRegistry');
const logger = require('../../utils/logger');

// Create notification registry singleton
const NotificationRegistry = new BaseRegistry('Notification', 'notifications');

/**
 * Notification Loader - Loads notifications from the notifications folder
 * Extends BaseLoader with notification-specific mappings
 */
class NotificationLoader extends BaseLoader {
    constructor() {
        super({
            modulePath: __dirname,
            moduleName: 'Notification',
            moduleNamePlural: 'notifications',
            registry: NotificationRegistry,
            configKey: 'notifications',
            excludePatterns: ['Helper.js', 'gameListHelper.js'],
            specialMappings: {
                'UpcomingGames': 'upcomingGames',
                'BettingReminder': 'bettingReminder',
                'welcomeUsers': 'welcomeUsers'
            }
        });
    }
}

// Create singleton instance
const loader = new NotificationLoader();

/**
 * Main function to load all notifications automatically
 * @param {Object} config - Configuration object
 * @returns {Promise<Array>} Array of loaded notifications
 */
async function loadNotifications(config = null) {
    return await loader.loadAllModules(config);
}

/**
 * Reload all notifications
 * @returns {Promise<Array>} Array of reloaded notifications
 */
async function reloadNotifications() {
    return await loader.reloadAllModules();
}

/**
 * Get loaded notifications
 * @returns {Array} Array of loaded notifications
 */
function getLoadedNotifications() {
    return loader.getLoadedModules();
}

/**
 * Get notification by ID
 * @param {string} notificationId - Notification ID
 * @returns {Object|null} Notification instance or null
 */
function getNotification(notificationId) {
    return loader.getModule(notificationId);
}

/**
 * Get loader statistics
 * @returns {Object} Loader statistics
 */
function getStats() {
    return loader.getStats();
}

module.exports = {
    loadNotifications,
    reloadNotifications,
    getLoadedNotifications,
    getNotification,
    getStats,
    NotificationLoader,
    NotificationRegistry, // Export registry for backward compatibility
    // Also export individual notification classes for manual use
    WelcomeUsersNotification: require('./welcomeUsers'),
    UpcomingGames: require('./UpcomingGames'),
    BettingReminder: require('./BettingReminder')
};
