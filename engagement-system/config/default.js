'use strict';

/**
 * Unified Engagement System Configuration
 * Choose which platform to use: 'telegram', 'whatsapp', 'instagram', 'facebook'
 */
module.exports = {
    // =================================================================
    // PLATFORM SELECTION
    // =================================================================
    // Choose your platform: 'telegram' | 'whatsapp' | 'instagram' | 'facebook'
    platform: process.env.ENGAGEMENT_PLATFORM || 'telegram',
    
    // Enable/disable engagement system
    enabled: process.env.ENGAGEMENT_ENABLED === 'true' || process.env.TELEGRAM_ENGAGEMENT_ENABLED === 'true',
    
    // Pool ID to monitor
    poolId: parseInt(process.env.ENGAGEMENT_POOL_ID) || parseInt(process.env.TELEGRAM_POOL_ID) || parseInt(process.env.WHATSAPP_POOL_ID) || 23,
    
    // =================================================================
    // TELEGRAM PLATFORM CONFIGURATION
    // =================================================================
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        groupId: process.env.TELEGRAM_GROUP_ID,
        mockMode: process.env.TELEGRAM_MOCK_MODE === 'true'
    },
    
    // =================================================================
    // WHATSAPP PLATFORM CONFIGURATION
    // =================================================================
    whatsapp: {
        apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0',
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        groupId: process.env.WHATSAPP_GROUP_ID,
        mockMode: process.env.WHATSAPP_MOCK_MODE === 'true'
    },
    
    // =================================================================
    // INSTAGRAM PLATFORM CONFIGURATION (Future)
    // =================================================================
    instagram: {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
        accountId: process.env.INSTAGRAM_ACCOUNT_ID,
        mockMode: process.env.INSTAGRAM_MOCK_MODE === 'true'
    },
    
    // =================================================================
    // FACEBOOK PLATFORM CONFIGURATION (Future)
    // =================================================================
    facebook: {
        accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
        pageId: process.env.FACEBOOK_PAGE_ID,
        groupId: process.env.FACEBOOK_GROUP_ID,
        mockMode: process.env.FACEBOOK_MOCK_MODE === 'true'
    },
    
    // =================================================================
    // ENGAGEMENT MANAGER CONFIGURATION
    // =================================================================
    manager: {
        runInterval: parseInt(process.env.ENGAGEMENT_RUN_INTERVAL) || 60000, // 1 minute
        maxMessagesPerHour: parseInt(process.env.ENGAGEMENT_MAX_MESSAGES_PER_HOUR) || 10,
        maxMessagesPerDay: parseInt(process.env.ENGAGEMENT_MAX_MESSAGES_PER_DAY) || 50,
        priorityMessageCooldown: parseInt(process.env.ENGAGEMENT_PRIORITY_COOLDOWN) || 900000, // 15 minutes
        regularMessageCooldown: parseInt(process.env.ENGAGEMENT_REGULAR_COOLDOWN) || 1800000, // 30 minutes
    },
    
    // =================================================================
    // NOTIFICATIONS CONFIGURATION
    // =================================================================
    notifications: {
        welcomeUsers: {
            enabled: false,
            cooldown: 3600000, // 1 hour
            priority: 'high',
            lookbackHours: 1
        },
        upcomingGames: {
            enabled: false,
            cooldown: 43200000, // 12 hours
            priority: 'high',
            timeFilter: 'all', // 'all' or 'day'
            minGamesToTrigger: 1
        },
        bettingReminder: {
            enabled: false,
            cooldown: 86400000, // 24 hours
            priority: 'medium',
            timeFilter: 'day', // 'all' or 'day'
            minGamesToTrigger: 1
        }
    },
    
    // =================================================================
    // INSIGHTS CONFIGURATION
    // =================================================================
    insights: {
        winningStreak: {
            enabled: false,
            minStreakLength: 3,
            cooldown: 3600000, // 1 hour
            priority: 'high'
        },
        roundBiggestJump: {
            enabled: false,
            minJump: 5, // Minimum points to trigger
            cooldown: 43200000, // 12 hours
            priority: 'high'
        },
        poolBiggestJump: {
            enabled: false,
            minJump: 10, // Minimum points for all-time best
            cooldown: 86400000, // 24 hours (less frequent)
            priority: 'high'
        }
    },
    
    // =================================================================
    // POLLS CONFIGURATION (Reused from WhatsApp)
    // =================================================================
    polls: {
        matchOutcome: {
            enabled: false,
            cooldown: 7200000, // 2 hours
            priority: 'high'
        },
        scorePrediction: {
            enabled: false,
            cooldown: 1800000, // 30 minutes
            priority: 'medium'
        },
        teamPerformance: {
            enabled: false,
            cooldown: 7200000, // 2 hours
            priority: 'medium'
        }
    },
    
    // =================================================================
    // LOGGING CONFIGURATION
    // =================================================================
    logging: {
        level: process.env.ENGAGEMENT_LOG_LEVEL || 'info',
        enableDebug: process.env.ENGAGEMENT_DEBUG === 'true'
    }
};

