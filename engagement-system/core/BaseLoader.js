'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

/**
 * Base Loader - Generic loader for insights, notifications, and polls
 * Provides common functionality for loading modules from a folder
 */
class BaseLoader {
    /**
     * Create a new base loader
     * @param {Object} options - Loader options
     * @param {string} options.modulePath - Path to the module folder
     * @param {string} options.moduleName - Name of the module type (e.g., 'insight', 'notification', 'poll')
     * @param {string} options.moduleNamePlural - Plural name (e.g., 'insights', 'notifications', 'polls')
     * @param {Object} options.registry - Registry to use for registering modules
     * @param {string} options.configKey - Key in config object (e.g., 'insights', 'notifications', 'polls')
     * @param {Array<string>} options.excludePatterns - Patterns to exclude from loading (default: ['Helper.js'])
     */
    constructor(options) {
        this.modulePath = options.modulePath;
        this.moduleName = options.moduleName;
        this.moduleNamePlural = options.moduleNamePlural;
        this.registry = options.registry;
        this.configKey = options.configKey;
        this.excludePatterns = options.excludePatterns || ['Helper.js'];
        this.specialMappings = options.specialMappings || {};
        this.config = null;
        this.loadedModules = new Map();
    }

    /**
     * Load configuration
     * @param {Object} config - Configuration object
     */
    setConfig(config) {
        this.config = config;
        logger.debug(`${this.moduleName}Loader: Configuration set`);
    }

    /**
     * Automatically load and register all modules from the folder
     * @param {Object} config - Configuration object
     * @returns {Promise<Array>} Array of loaded module instances
     */
    async loadAllModules(config = null) {
        try {
            if (config) {
                this.setConfig(config);
            }

            if (!this.config) {
                logger.warn(`${this.moduleName}Loader: No configuration provided, using defaults`);
                this.config = this.getDefaultConfig();
            }

            logger.info(`${this.moduleName}Loader: Starting automatic ${this.moduleName} loading...`);

            // Get all JavaScript files in the folder
            const moduleFiles = this.getModuleFiles();
            logger.debug(`${this.moduleName}Loader: Found ${moduleFiles.length} ${this.moduleName} files`);

            const loadedModules = [];

            for (const file of moduleFiles) {
                try {
                    const module = await this.loadModuleFromFile(file);
                    if (module) {
                        loadedModules.push(module);
                        logger.debug(`${this.moduleName}Loader: Loaded ${this.moduleName} ${module.id}`);
                    }
                } catch (error) {
                    logger.error(`${this.moduleName}Loader: Error loading ${this.moduleName} from ${file}:`, error);
                }
            }

            logger.info(`${this.moduleName}Loader: Successfully loaded ${loadedModules.length} ${this.moduleNamePlural}`);
            return loadedModules;

        } catch (error) {
            logger.error(`${this.moduleName}Loader: Error loading ${this.moduleNamePlural}:`, error);
            return [];
        }
    }

    /**
     * Get all JavaScript files in the module folder
     * @returns {Array} Array of file paths
     */
    getModuleFiles() {
        try {
            const files = fs.readdirSync(this.modulePath);
            
            return files
                .filter(file => {
                    // Include only .js files
                    if (!file.endsWith('.js')) return false;
                    
                    // Exclude index.js
                    if (file === 'index.js') return false;
                    
                    // Exclude test files
                    if (file.includes('.test.') || file.includes('.spec.')) return false;
                    
                    // Exclude patterns (e.g., Helper.js)
                    for (const pattern of this.excludePatterns) {
                        if (file.includes(pattern)) return false;
                    }
                    
                    return true;
                })
                .map(file => path.join(this.modulePath, file));
        } catch (error) {
            logger.error(`${this.moduleName}Loader: Error reading ${this.moduleNamePlural} directory:`, error);
            return [];
        }
    }

    /**
     * Load a single module from a file
     * @param {string} filePath - Path to the module file
     * @returns {Promise<Object|null>} Loaded module instance or null
     */
    async loadModuleFromFile(filePath) {
        try {
            const fileName = path.basename(filePath, '.js');
            
            // Dynamic import of the module class
            const ModuleClass = require(filePath);
            
            if (!ModuleClass || typeof ModuleClass !== 'function') {
                logger.warn(`${this.moduleName}Loader: ${fileName} does not export a valid class`);
                return null;
            }

            // Handle special cases (can be overridden in subclass)
            const specialResult = await this.handleSpecialCases(fileName, ModuleClass);
            if (specialResult !== undefined) {
                return specialResult;
            }

            // Get configuration for this specific module
            const moduleConfig = this.getModuleConfig(fileName);
            
            // Skip if module is disabled in config
            if (moduleConfig && moduleConfig.enabled === false) {
                logger.debug(`${this.moduleName}Loader: Skipping ${fileName} (disabled in config)`);
                return null;
            }

            // Create module instance with configuration
            const moduleInstance = new ModuleClass(moduleConfig);
            
            // Validate module instance
            if (!this.validateModule(moduleInstance, fileName)) {
                return null;
            }

            // Register the module
            this.registry.register(moduleInstance);
            this.loadedModules.set(moduleInstance.id, moduleInstance);
            
            logger.debug(`${this.moduleName}Loader: Registered ${fileName} as ${moduleInstance.id}`);
            return moduleInstance;

        } catch (error) {
            logger.error(`${this.moduleName}Loader: Error loading ${this.moduleName} from ${filePath}:`, error);
            return null;
        }
    }

    /**
     * Handle special cases (override in subclass if needed)
     * @param {string} fileName - File name
     * @param {Function} ModuleClass - Module class
     * @returns {Promise<Object|undefined>} Module instance or undefined if no special handling
     */
    async handleSpecialCases(fileName, ModuleClass) {
        // Override in subclass if needed
        return undefined;
    }

    /**
     * Get configuration for a specific module
     * @param {string} fileName - Name of the module file
     * @returns {Object} Configuration object for the module
     */
    getModuleConfig(fileName) {
        if (!this.config || !this.config[this.configKey]) {
            return this.getDefaultModuleConfig();
        }

        // Convert fileName to config key
        const configKey = this.fileNameToConfigKey(fileName);
        const moduleConfig = this.config[this.configKey][configKey];

        if (!moduleConfig) {
            logger.debug(`${this.moduleName}Loader: No config found for ${fileName}, using defaults`);
            return this.getDefaultModuleConfig();
        }

        return {
            ...this.getDefaultModuleConfig(),
            ...moduleConfig
        };
    }

    /**
     * Convert file name to configuration key
     * @param {string} fileName - File name (e.g., "WinningStreakInsight")
     * @returns {string} Config key (e.g., "winningStreak")
     */
    fileNameToConfigKey(fileName) {
        // Check special mappings first
        if (this.specialMappings[fileName]) {
            return this.specialMappings[fileName];
        }
        
        // Generic: Remove common suffixes and convert to camelCase
        const baseName = fileName.replace(/(Insight|Notification|Poll)$/, '');
        return baseName.charAt(0).toLowerCase() + baseName.slice(1);
    }

    /**
     * Get default configuration for a module
     * @returns {Object} Default configuration
     */
    getDefaultModuleConfig() {
        return {
            enabled: true,
            priority: 'medium',
            schedule: 'always',
            cooldown: 3600000, // 1 hour
            poolId: this.config?.poolId || 23
        };
    }

    /**
     * Get default configuration for the loader
     * @returns {Object} Default configuration
     */
    getDefaultConfig() {
        return {
            poolId: 23,
            [this.configKey]: {}
        };
    }

    /**
     * Validate a module instance
     * @param {Object} module - Module instance
     * @param {string} fileName - File name for logging
     * @returns {boolean} True if valid
     */
    validateModule(module, fileName) {
        if (!module.id || !module.name) {
            logger.warn(`${this.moduleName}Loader: ${fileName} missing required properties (id, name)`);
            return false;
        }

        if (typeof module.shouldTrigger !== 'function') {
            logger.warn(`${this.moduleName}Loader: ${fileName} missing shouldTrigger method`);
            return false;
        }

        if (typeof module.buildMessage !== 'function') {
            logger.warn(`${this.moduleName}Loader: ${fileName} missing buildMessage method`);
            return false;
        }

        return true;
    }

    /**
     * Get all loaded modules
     * @returns {Array} Array of loaded module instances
     */
    getLoadedModules() {
        return Array.from(this.loadedModules.values());
    }

    /**
     * Get module by ID
     * @param {string} moduleId - Module ID
     * @returns {Object|null} Module instance or null
     */
    getModule(moduleId) {
        return this.loadedModules.get(moduleId) || null;
    }

    /**
     * Reload all modules (useful for development)
     * @returns {Promise<Array>} Array of reloaded modules
     */
    async reloadAllModules() {
        logger.info(`${this.moduleName}Loader: Reloading all ${this.moduleNamePlural}...`);
        
        // Clear existing modules
        this.loadedModules.clear();
        
        // Clear registry
        const allModules = this.registry.getAllModules();
        for (const module of allModules) {
            this.registry.unregister(module.id);
        }
        
        // Reload all modules
        return await this.loadAllModules();
    }

    /**
     * Get loader statistics
     * @returns {Object} Loader statistics
     */
    getStats() {
        return {
            totalFiles: this.getModuleFiles().length,
            loadedModules: this.loadedModules.size,
            moduleIds: Array.from(this.loadedModules.keys()),
            config: this.config
        };
    }
}

module.exports = BaseLoader;

