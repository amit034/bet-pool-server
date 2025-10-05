/**
 * Tool Configuration and Registry
 * 
 * Central configuration for all AI tools
 */

const { getAllTools, getTool, getToolsByCategory } = require('./index');

class ToolConfig {
    constructor() {
        this.tools = getAllTools();
        this.config = {
            // Default settings
            defaultLimit: 10,
            excludeBotsDefault: false,
            cacheTimeout: 300000, // 5 minutes in milliseconds
            
            // Tool-specific settings
            userMetrics: {
                maxLimit: 50,
                defaultRounds: null
            },
            recoveryAnalysis: {
                defaultMinPositionJump: 3,
                maxLimit: 20
            },
            statistics: {
                defaultAnalysisType: 'overview',
                enableCaching: true
            },
            rankings: {
                defaultRankingType: 'current',
                maxHistoricalRounds: 20
            }
        };
        
        this.cache = new Map();
    }

    /**
     * Get tool configuration
     */
    getToolConfig(toolName) {
        return this.config[toolName] || {};
    }

    /**
     * Update tool configuration
     */
    updateToolConfig(toolName, config) {
        this.config[toolName] = { ...this.config[toolName], ...config };
    }

    /**
     * Get all available tools with their descriptions
     */
    getToolDescriptions() {
        return this.tools.map(tool => ({
            name: tool.name,
            description: tool.description
        }));
    }

    /**
     * Validate tool input parameters
     */
    validateInput(toolName, input) {
        const errors = [];
        const params = typeof input === 'string' ? JSON.parse(input) : input;

        // Common validations
        if (!params.poolId) {
            errors.push('poolId is required');
        }

        // Tool-specific validations
        switch (toolName) {
            case 'user_metrics':
                if (params.limit && (params.limit < 1 || params.limit > this.config.userMetrics.maxLimit)) {
                    errors.push(`limit must be between 1 and ${this.config.userMetrics.maxLimit}`);
                }
                break;
                
            case 'recovery_analysis':
                if (params.minPositionJump && params.minPositionJump < 1) {
                    errors.push('minPositionJump must be at least 1');
                }
                if (params.limit && params.limit > this.config.recoveryAnalysis.maxLimit) {
                    errors.push(`limit cannot exceed ${this.config.recoveryAnalysis.maxLimit}`);
                }
                break;
                
            case 'statistics':
                const validAnalysisTypes = ['overview', 'distribution', 'trends', 'rounds', 'medals'];
                if (params.analysisType && !validAnalysisTypes.includes(params.analysisType)) {
                    errors.push(`analysisType must be one of: ${validAnalysisTypes.join(', ')}`);
                }
                break;
                
            case 'rankings':
                const validRankingTypes = ['current', 'historical', 'stability', 'trends'];
                if (params.rankingType && !validRankingTypes.includes(params.rankingType)) {
                    errors.push(`rankingType must be one of: ${validRankingTypes.join(', ')}`);
                }
                break;
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Get cached result if available
     */
    getCachedResult(cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    /**
     * Cache result
     */
    setCachedResult(cacheKey, data) {
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Generate cache key
     */
    generateCacheKey(toolName, input) {
        return `${toolName}:${JSON.stringify(input)}`;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            oldestEntry: Math.min(...Array.from(this.cache.values()).map(v => v.timestamp)),
            newestEntry: Math.max(...Array.from(this.cache.values()).map(v => v.timestamp))
        };
    }

    /**
     * Execute tool with validation and caching
     */
    async executeTool(toolName, input) {
        // Validate input
        const validation = this.validateInput(toolName, input);
        if (!validation.isValid) {
            throw new Error(`Validation errors: ${validation.errors.join(', ')}`);
        }

        // Check cache
        const cacheKey = this.generateCacheKey(toolName, input);
        const cachedResult = this.getCachedResult(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        // Execute tool
        const tool = getTool(toolName);
        if (!tool) {
            throw new Error(`Tool '${toolName}' not found`);
        }

        const result = await tool._call(input);
        
        // Cache result if caching is enabled
        if (this.config[toolName]?.enableCaching !== false) {
            this.setCachedResult(cacheKey, result);
        }

        return result;
    }

    /**
     * Get usage statistics
     */
    getUsageStats() {
        // This would typically be stored in a database
        // For now, return cache-based stats
        return this.getCacheStats();
    }
}

// Export singleton instance
module.exports = new ToolConfig();
