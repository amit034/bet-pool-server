/**
 * WhatsApp Tournament Bot Configuration Template
 * 
 * Copy this file to whatsapp-config.js and customize your settings.
 * You can also use environment variables instead of this file.
 * 
 * Environment variables take precedence over this config file.
 */

module.exports = {
    // REQUIRED: WhatsApp Group ID where the bot will send daily announcements
    // Format: "120363043968066787@g.us"
    // To find this: Add bot to group, send message, check logs
    groupId: process.env.WHATSAPP_GROUP_ID || "120363418993607043@g.us",

    // Time for daily game announcements (HH:mm format)
    dailyTime: process.env.WHATSAPP_DAILY_TIME || "09:00",

    // Timezone for scheduling announcements
    timezone: process.env.WHATSAPP_TIMEZONE || "Asia/Jerusalem",

    // Comma-separated list of admin phone numbers (with country code, no + or spaces)
    // Example: "972501234567,972501234568"
    adminNumbers: process.env.WHATSAPP_ADMIN_NUMBERS || "972544623994",

    // Enable/disable the bot
    enabled: process.env.WHATSAPP_BOT_ENABLED !== 'false',

    // Auto-reconnect on disconnect
    autoReconnect: process.env.WHATSAPP_AUTO_RECONNECT !== 'false',

    // Maximum reconnection attempts
    maxRetries: parseInt(process.env.WHATSAPP_MAX_RETRIES || '3'),

    // Use emojis in messages
    useEmojis: process.env.WHATSAPP_USE_EMOJIS !== 'false',

    // Additional bot settings
    settings: {
        // Response delay in milliseconds (to appear more human-like)
        responseDelay: 1000,

        // Maximum message length before splitting
        maxMessageLength: 4000,

        // Enable detailed logging
        detailedLogging: true,

        // Bot personality settings
        personality: {
            greeting: "Hello! I'm your tournament assistant.",
            helpPrompt: "Need help? Just ask me about games, betting, or standings!",
            errorMessage: "Sorry, I encountered an issue. Please try again later.",
            noDataMessage: "No information available right now."
        }
    },

    // Feature flags
    features: {
        // Enable daily announcements
        dailyAnnouncements: true,

        // Enable betting assistance in private messages
        bettingAssistance: true,

        // Enable standings/leaderboard
        standings: true,

        // Enable admin commands
        adminCommands: true,

        // Enable automatic game result updates
        gameResultUpdates: false
    }
};

/**
 * QUICK SETUP GUIDE:
 * 
 * 1. Copy this file:
 *    cp config/whatsapp-config.template.js config/whatsapp-config.js
 * 
 * 2. Edit config/whatsapp-config.js with your settings
 * 
 * 3. OR set environment variables:
 *    export WHATSAPP_GROUP_ID="your_group_id_here"
 *    export WHATSAPP_DAILY_TIME="09:00"
 *    export WHATSAPP_TIMEZONE="Asia/Jerusalem"
 *    export WHATSAPP_ADMIN_NUMBERS="972501234567,972501234568"
 * 
 * 4. Start the bot:
 *    npm run start-whatsapp-bot
 * 
 * 5. Scan QR code and add bot to your group
 * 
 * FINDING GROUP ID:
 * - Start the bot (shows QR code)
 * - Scan QR code with WhatsApp
 * - Add the bot account to your WhatsApp group
 * - Send any message to the group
 * - Check logs for group ID (format: 120363...@g.us)
 * - Update this config or set WHATSAPP_GROUP_ID environment variable
 */
