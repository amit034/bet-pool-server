'use strict';

const BaseLoader = require('../core/BaseLoader');
const PollRegistry = require('../core/PollRegistry');
const logger = require('../../utils/logger');

/**
 * Poll Loader - Loads polls from the polls folder
 * Extends BaseLoader with poll-specific validation
 */
class PollLoader extends BaseLoader {
    constructor() {
        super({
            modulePath: __dirname,
            moduleName: 'Poll',
            moduleNamePlural: 'polls',
            registry: PollRegistry,
            configKey: 'polls',
            excludePatterns: ['Helper.js'],
            specialMappings: {}
        });
    }

    /**
     * Validate a poll instance - polls have additional onResult method
     * @param {Object} poll - Poll instance
     * @param {string} fileName - File name for logging
     * @returns {boolean} True if valid
     */
    validateModule(poll, fileName) {
        // First check common validations
        if (!super.validateModule(poll, fileName)) {
            return false;
        }

        // Polls have additional onResult method
        if (typeof poll.onResult !== 'function') {
            logger.warn(`PollLoader: ${fileName} missing onResult method`);
            return false;
        }

        return true;
    }
}

// Create singleton instance
const loader = new PollLoader();

/**
 * Main function to load all polls automatically
 * @param {Object} config - Configuration object
 * @returns {Promise<Array>} Array of loaded polls
 */
async function loadPolls(config = null) {
    return await loader.loadAllModules(config);
}

/**
 * Reload all polls
 * @returns {Promise<Array>} Array of reloaded polls
 */
async function reloadPolls() {
    return await loader.reloadAllModules();
}

/**
 * Get loaded polls
 * @returns {Array} Array of loaded polls
 */
function getLoadedPolls() {
    return loader.getLoadedModules();
}

/**
 * Get poll by ID
 * @param {string} pollId - Poll ID
 * @returns {Object|null} Poll instance or null
 */
function getPoll(pollId) {
    return loader.getModule(pollId);
}

/**
 * Get loader statistics
 * @returns {Object} Loader statistics
 */
function getStats() {
    return loader.getStats();
}

module.exports = {
    loadPolls,
    reloadPolls,
    getLoadedPolls,
    getPoll,
    getStats,
    PollLoader
};
