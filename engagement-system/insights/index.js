'use strict';

const path = require('path');
const BaseLoader = require('../core/BaseLoader');
const BaseRegistry = require('../core/BaseRegistry');
const logger = require('../../utils/logger');

// Create insight registry singleton
const InsightRegistry = new BaseRegistry('Insight', 'insights');

/**
 * Insight Loader - Loads insights from the insights folder
 * Extends BaseLoader for consistent loading behavior
 */
class InsightLoader extends BaseLoader {
    constructor() {
        super({
            modulePath: __dirname,
            moduleName: 'Insight',
            moduleNamePlural: 'insights',
            registry: InsightRegistry,
            configKey: 'insights',
            excludePatterns: ['Helper.js'],
            specialMappings: {}
        });
    }
}

// Create singleton instance
const loader = new InsightLoader();

/**
 * Main function to load all insights automatically
 * @param {Object} config - Configuration object
 * @returns {Promise<Array>} Array of loaded insights
 */
async function loadInsights(config = null) {
    return await loader.loadAllModules(config);
}

/**
 * Reload all insights
 * @returns {Promise<Array>} Array of reloaded insights
 */
async function reloadInsights() {
    return await loader.reloadAllModules();
}

/**
 * Get loaded insights
 * @returns {Array} Array of loaded insights
 */
function getLoadedInsights() {
    return loader.getLoadedModules();
}

/**
 * Get insight by ID
 * @param {string} insightId - Insight ID
 * @returns {Object|null} Insight instance or null
 */
function getInsight(insightId) {
    return loader.getModule(insightId);
}

/**
 * Get loader statistics
 * @returns {Object} Loader statistics
 */
function getStats() {
    return loader.getStats();
}

module.exports = {
    loadInsights,
    reloadInsights,
    getLoadedInsights,
    getInsight,
    getStats,
    InsightLoader,
    InsightRegistry // Export registry for backward compatibility
};
