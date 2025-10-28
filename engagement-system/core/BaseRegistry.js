'use strict';

/**
 * Base Registry Class - Manages engagement modules (insights, notifications, polls)
 * Provides centralized registration and management of engagement modules
 * 
 * This is the parent class for InsightRegistry, NotificationRegistry, and PollRegistry
 * following DRY principles by extracting common functionality.
 */
class BaseRegistry {
    constructor(moduleName = 'module', moduleNamePlural = 'modules') {
        this.moduleName = moduleName; // 'insight', 'notification', 'poll'
        this.moduleNamePlural = moduleNamePlural; // 'insights', 'notifications', 'polls'
        this.modules = new Map(); // Map of all registered modules
        this.activeModules = new Set(); // Set of active module IDs
    }

    /**
     * Register a new module
     * @param {BaseEngagementModule} module - The module to register
     */
    register(module) {
        if (!module.id || !module.name) {
            throw new Error(`${this.moduleName} must have id and name properties`);
        }

        // Prevent double registration
        if (this.modules.has(module.id)) {
            console.log(`${this.moduleName}Registry: ${this.moduleName} ${module.id} already registered, skipping...`);
            return;
        }

        this.modules.set(module.id, module);
        
        // Auto-activate if not explicitly disabled
        if (module.status !== 'disabled') {
            this.activeModules.add(module.id);
        }

        console.log(`${this.moduleName}Registry: Registered ${this.moduleName} ${module.id}`);
    }

    /**
     * Unregister a module
     * @param {string} moduleId - The ID of the module to unregister
     */
    unregister(moduleId) {
        this.modules.delete(moduleId);
        this.activeModules.delete(moduleId);
        console.log(`${this.moduleName}Registry: Unregistered ${this.moduleName} ${moduleId}`);
    }

    /**
     * Get all active modules
     * @returns {Array<BaseEngagementModule>} Array of active modules
     */
    getActiveModules() {
        const active = [];
        
        for (const moduleId of this.activeModules) {
            const module = this.modules.get(moduleId);
            if (module) {
                active.push(module);
            }
        }
        
        return active;
    }

    /**
     * Get all registered modules (active and inactive)
     * @returns {Array<BaseEngagementModule>} Array of all modules
     */
    getAllModules() {
        return Array.from(this.modules.values());
    }

    /**
     * Get a specific module by ID
     * @param {string} moduleId - The ID of the module to get
     * @returns {BaseEngagementModule|null} The module or null if not found
     */
    getModule(moduleId) {
        return this.modules.get(moduleId) || null;
    }

    /**
     * Activate a module
     * @param {string} moduleId - The ID of the module to activate
     */
    activate(moduleId) {
        if (this.modules.has(moduleId)) {
            this.activeModules.add(moduleId);
            console.log(`${this.moduleName}Registry: Activated ${this.moduleName} ${moduleId}`);
        }
    }

    /**
     * Deactivate a module
     * @param {string} moduleId - The ID of the module to deactivate
     */
    deactivate(moduleId) {
        this.activeModules.delete(moduleId);
        console.log(`${this.moduleName}Registry: Deactivated ${this.moduleName} ${moduleId}`);
    }

    /**
     * Get modules by schedule type
     * @param {string} schedule - The schedule type (always, daily, match_days)
     * @returns {Array<BaseEngagementModule>} Array of modules with the specified schedule
     */
    getBySchedule(schedule) {
        return this.getActiveModules().filter(module => module.schedule === schedule);
    }

    /**
     * Get modules by priority
     * @param {string} priority - The priority level (high, medium, low)
     * @returns {Array<BaseEngagementModule>} Array of modules with the specified priority
     */
    getByPriority(priority) {
        return this.getActiveModules().filter(module => module.priority === priority);
    }

    /**
     * Get registry statistics
     * Can be overridden by subclasses to add additional stats
     * @returns {Object} Statistics about the registry
     */
    getStats() {
        const stats = {
            [`total${this.moduleName.charAt(0).toUpperCase() + this.moduleName.slice(1)}s`]: this.modules.size,
            [`active${this.moduleName.charAt(0).toUpperCase() + this.moduleName.slice(1)}s`]: this.activeModules.size,
            [`inactive${this.moduleName.charAt(0).toUpperCase() + this.moduleName.slice(1)}s`]: this.modules.size - this.activeModules.size,
            bySchedule: {
                always: this.getBySchedule('always').length,
                daily: this.getBySchedule('daily').length,
                match_days: this.getBySchedule('match_days').length
            },
            byPriority: {
                high: this.getByPriority('high').length,
                medium: this.getByPriority('medium').length,
                low: this.getByPriority('low').length
            }
        };

        return stats;
    }
}

module.exports = BaseRegistry;




