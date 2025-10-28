'use strict';

const RoundBiggestJumpInsight = require('./RoundBiggestJumpInsight');

/**
 * Pool Biggest Jump Insight - Celebrates all-time best jumps (if they happened in last round)
 * Extends RoundBiggestJumpInsight with different configuration for pool-level (all-time) tracking
 */
class PoolBiggestJumpInsight extends RoundBiggestJumpInsight {
    constructor(config = {}) {
        super({
            id: 'pool_biggest_jump',
            name: 'Pool All-Time Best Jump',
            cooldown: 86400000, // 24 hours (longer than round)
            minJump: 10, // Higher threshold for all-time records
            granularity: 'pool',
            granularityDescription: 'all-time best jump',
            recordType: 'all-time best',
            isAllTimeBestRecord: true,
            ...config // User config overrides
        });
    }

    // That's it! All behavior is configured through properties.
    // The parent class handles all the logic using these properties.
}

module.exports = PoolBiggestJumpInsight;
