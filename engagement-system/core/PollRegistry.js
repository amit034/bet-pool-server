'use strict';

const BaseRegistry = require('./BaseRegistry');

/**
 * Poll Registry - Manages all poll modules
 * Extends BaseRegistry with poll-specific functionality:
 * - Single active poll tracking (only one poll can be "running" at a time)
 */
class PollRegistry extends BaseRegistry {
    constructor() {
        super('Poll', 'polls');
        this.activePollId = null; // Only one poll can be actively running at a time
    }

    /**
     * Unregister a poll module
     * Overrides base to clear active poll if it's the one being unregistered
     * @param {string} pollId - The ID of the poll to unregister
     */
    unregister(pollId) {
        super.unregister(pollId); // Call base method
        
        // Clear active poll if it's the one being unregistered
        if (this.activePollId === pollId) {
            this.activePollId = null;
        }
    }

    /**
     * Deactivate a poll module
     * Overrides base to clear active poll if it's the one being deactivated
     * @param {string} pollId - The ID of the poll to deactivate
     */
    deactivate(pollId) {
        super.deactivate(pollId); // Call base method
        
        // Clear active poll if it's the one being deactivated
        if (this.activePollId === pollId) {
            this.activePollId = null;
        }
    }

    /**
     * Set the currently active poll
     * @param {string} pollId - The ID of the poll that is currently active
     */
    setActivePoll(pollId) {
        this.activePollId = pollId;
        console.log(`PollRegistry: Set active poll to ${pollId}`);
    }

    /**
     * Clear the currently active poll
     */
    clearActivePoll() {
        this.activePollId = null;
        console.log(`PollRegistry: Cleared active poll`);
    }

    /**
     * Check if there's currently an active poll
     * @returns {boolean} True if there's an active poll
     */
    hasActivePoll() {
        return this.activePollId !== null;
    }

    /**
     * Get the currently active poll
     * @returns {BasePoll|null} The currently active poll or null
     */
    getCurrentActivePoll() {
        if (this.activePollId) {
            return this.modules.get(this.activePollId) || null;
        }
        return null;
    }

    /**
     * Get registry statistics
     * Overrides base to add poll-specific stats
     * @returns {Object} Statistics about the registry
     */
    getStats() {
        const baseStats = super.getStats(); // Get base stats
        
        return {
            ...baseStats,
            // Add poll-specific stat
            currentActivePoll: this.activePollId
        };
    }

    // Inherited from BaseRegistry:
    // - register(poll)
    // - getModule(pollId) ← use this directly instead of getPoll()
    // - getActiveModules()
    // - getAllModules()
    // - activate(pollId)
    // - getBySchedule(schedule)
    // - getByPriority(priority)
}

// Create singleton instance
const registry = new PollRegistry();

module.exports = registry;
