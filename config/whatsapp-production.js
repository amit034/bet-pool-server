module.exports = {
    // Production WhatsApp Bot Configuration
    
    // REQUIRED: Set these environment variables on your AWS server
    groupId: process.env.WHATSAPP_GROUP_ID,
    dailyTime: process.env.WHATSAPP_DAILY_TIME || "09:00",
    timezone: process.env.WHATSAPP_TIMEZONE || "Asia/Jerusalem",
    adminNumbers: process.env.WHATSAPP_ADMIN_NUMBERS || "",
    
    // Production settings
    enabled: process.env.WHATSAPP_BOT_ENABLED !== 'false',
    useEmojis: process.env.WHATSAPP_USE_EMOJIS !== 'false',
    autoReconnect: true,
    maxRetries: 5, // Higher for production
    
    // AWS/Server specific settings
    production: {
        headless: true,
        chromePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        sessionPath: "./.wwebjs_auth",
        
        // Server resource limits
        timeout: 60000,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--single-process' // For low memory environments
        ]
    },
    
    // Session backup settings
    backup: {
        enabled: true,
        interval: 24 * 60 * 60 * 1000, // 24 hours
        path: "./whatsapp-session-backup"
    }
};