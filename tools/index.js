/**
 * AI Tools for Bet Pool Analytics
 * 
 * This module provides LangChain tools for analyzing betting pool data,
 * user performance, and generating insights about scores, rankings, and recoveries.
 */

const { UserMetricsTool } = require('./UserMetricsTool');
const { RecoveryAnalysisTool } = require('./RecoveryAnalysisTool');
const { StatisticsTool } = require('./StatisticsTool');
const { RankingsTool } = require('./RankingsTool');

/**
 * Registry of all available AI tools
 */
const toolRegistry = {
    userMetrics: new UserMetricsTool(),
    recoveryAnalysis: new RecoveryAnalysisTool(),
    statistics: new StatisticsTool(),
    rankings: new RankingsTool()
};

/**
 * Get all tools as an array for LangChain
 * @returns {Array} Array of LangChain tools
 */
function getAllTools() {
    return Object.values(toolRegistry);
}

/**
 * Get a specific tool by name
 * @param {string} toolName - Name of the tool
 * @returns {Object|null} The requested tool or null if not found
 */
function getTool(toolName) {
    return toolRegistry[toolName] || null;
}

/**
 * Get tools by category
 * @param {string} category - Category of tools ('analytics', 'rankings', 'recovery')
 * @returns {Array} Array of tools in the specified category
 */
function getToolsByCategory(category) {
    const categoryMap = {
        analytics: ['userMetrics', 'statistics'],
        rankings: ['rankings'],
        recovery: ['recoveryAnalysis']
    };
    
    const toolNames = categoryMap[category] || [];
    return toolNames.map(name => toolRegistry[name]).filter(Boolean);
}

module.exports = {
    toolRegistry,
    getAllTools,
    getTool,
    getToolsByCategory
};
