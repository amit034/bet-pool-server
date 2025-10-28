# Unified Engagement System

## 🎯 **OVERVIEW**

A platform-agnostic engagement system for betting pools that works with multiple social media platforms. Simply configure which platform you want to use (Telegram, WhatsApp, Instagram, Facebook) and the system handles the rest!

---

## ✨ **KEY FEATURES**

### **✅ Platform-Agnostic Design**
- Single codebase works with all platforms
- Switch platforms with a single configuration change
- Easy to add new platforms (Instagram, Facebook, etc.)

### **✅ Polymorphic Architecture**
- All platforms implement the same interface (BasePlatform)
- Insights and polls work on any platform
- No platform-specific code in business logic

### **✅ Currently Supported Platforms**
- ✅ **Telegram** - Full support (messages & native polls)
- ✅ **WhatsApp** - Partial support (messages only, no native polls)
- 🔄 **Instagram** - Coming soon
- 🔄 **Facebook** - Coming soon

---

## 🏗️ **ARCHITECTURE**

```
engagement-system/
├── core/
│   └── EngagementManager.js         # Platform-agnostic orchestrator
├── platforms/
│   ├── BasePlatform.js              # Abstract base class
│   ├── TelegramPlatform.js          # Telegram implementation
│   ├── WhatsAppPlatform.js          # WhatsApp implementation
│   ├── InstagramPlatform.js         # Future
│   └── FacebookPlatform.js          # Future
├── config/
│   └── default.js                   # Platform configuration
└── index.js                         # Main entry point
```

### **How It Works:**

```
EngagementSystem (Main)
    ↓
EngagementManager (Platform-agnostic)
    ↓
BasePlatform (Abstract interface)
    ↓
TelegramPlatform / WhatsAppPlatform / InstagramPlatform / FacebookPlatform
```

---

## 🚀 **QUICK START**

### **Step 1: Configure Platform**

Edit `.env` file:

```bash
# Choose your platform
ENGAGEMENT_PLATFORM=telegram  # or whatsapp, instagram, facebook

# Enable engagement system
ENGAGEMENT_ENABLED=true

# Pool ID to monitor
ENGAGEMENT_POOL_ID=23

# Telegram configuration (if using Telegram)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_GROUP_ID=your_group_id

# WhatsApp configuration (if using WhatsApp)
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
```

### **Step 2: Start Your Server**

```bash
node Server.js
```

You'll see:
```
✅ Engagement System started successfully
   Platform: telegram
   Pool ID: 23
   System will check for new users every minute
   Welcome messages will be sent automatically
```

That's it! The system will automatically:
- Check for new users every minute
- Send welcome messages
- Post achievement celebrations
- Create polls
- Send reminders and insights

---

## 🔄 **SWITCHING PLATFORMS**

### **Method 1: Environment Variable**

```bash
# Switch to Telegram
ENGAGEMENT_PLATFORM=telegram node Server.js

# Switch to WhatsApp
ENGAGEMENT_PLATFORM=whatsapp node Server.js
```

### **Method 2: Runtime Switching**

```javascript
const EngagementSystem = require('./engagement-system');

// Switch to WhatsApp
await EngagementSystem.switchPlatform('whatsapp');

// Switch to Telegram
await EngagementSystem.switchPlatform('telegram');
```

---

## 📱 **PLATFORM COMPARISON**

| Feature | Telegram | WhatsApp | Instagram | Facebook |
|---------|----------|----------|-----------|----------|
| Group Messages | ✅ | ❌* | 🔄 | 🔄 |
| Native Polls | ✅ | ❌ | 🔄 | 🔄 |
| Images | ✅ | ✅ | 🔄 | 🔄 |
| Rich Formatting | ✅ | ⚠️ | 🔄 | 🔄 |
| Free API | ✅ | ❌ | ❌ | ❌ |
| No Account Risk | ✅ | ⚠️ | ⚠️ | ⚠️ |

*WhatsApp Business API can only send to individual users, not groups

---

## 🎯 **HOW IT WORKS**

### **1. Platform-Agnostic Insights**

All insights work with any platform:

```javascript
// NewUserWelcomeInsight.js
class NewUserWelcomeInsight extends BaseInsight {
    async buildMessage() {
        return {
            type: 'welcome',
            content: '🎉 Welcome to the pool! 🎉',
            metadata: { source: 'Welcome Insight' }
        };
    }
}

// Works on Telegram, WhatsApp, Instagram, Facebook!
```

### **2. Platform-Specific Implementation**

Each platform handles the message in its own way:

```javascript
// TelegramPlatform.js
async sendMessage(message) {
    await this.bot.sendMessage(this.groupId, message.content);
}

// WhatsAppPlatform.js
async sendMessage(message) {
    // Send to individual users (WhatsApp limitation)
}

// InstagramPlatform.js (future)
async sendMessage(message) {
    // Post to Instagram story/feed
}
```

### **3. Automatic Platform Selection**

The EngagementManager automatically uses the configured platform:

```javascript
// Manager is platform-agnostic
const message = await insight.buildMessage();

// Automatically sends via configured platform (Telegram/WhatsApp/etc.)
await this.platform.sendMessage(message);
```

---

## 🔧 **ADDING A NEW PLATFORM**

Adding a new platform is easy! Just create a new class that extends `BasePlatform`:

### **Step 1: Create Platform Class**

```javascript
// platforms/InstagramPlatform.js
const BasePlatform = require('./BasePlatform');

class InstagramPlatform extends BasePlatform {
    constructor(config) {
        super(config);
        this.platformName = 'instagram';
    }

    async initialize() {
        // Initialize Instagram API
        this.isInitialized = true;
        return true;
    }

    async sendMessage(message) {
        // Post to Instagram story/feed
        const content = this.extractContent(message);
        // ... Instagram API call ...
        return { success: true, platform: 'instagram' };
    }

    async sendPoll(poll) {
        // Create Instagram story poll
        // ... Instagram API call ...
        return { success: true, platform: 'instagram' };
    }
}

module.exports = InstagramPlatform;
```

### **Step 2: Register Platform**

```javascript
// index.js
const InstagramPlatform = require('./platforms/InstagramPlatform');

async createPlatform(platformName) {
    switch (platformName) {
        case 'instagram':
            return new InstagramPlatform(this.config.instagram);
        // ... other platforms ...
    }
}
```

### **Step 3: Configure**

```bash
# .env
ENGAGEMENT_PLATFORM=instagram
INSTAGRAM_ACCESS_TOKEN=your_token
INSTAGRAM_ACCOUNT_ID=your_account_id
```

That's it! The entire system now works with Instagram!

---

## 📊 **MONITORING**

### **Check System Status:**

```javascript
const EngagementSystem = require('./engagement-system');
const status = EngagementSystem.getStatus();

console.log(status);
// Output:
// {
//   isInitialized: true,
//   isEnabled: true,
//   platform: 'telegram',
//   poolId: 23,
//   manager: {
//     isRunning: true,
//     platform: { name: 'telegram', isInitialized: true },
//     activeInsights: 4,
//     activePolls: 3
//   }
// }
```

### **Manual Triggers:**

```javascript
// Send a manual message
await EngagementSystem.sendMessage('Test message');

// Send a manual poll
await EngagementSystem.sendPoll({
    question: 'Who will win?',
    options: ['Team A', 'Team B']
});
```

---

## 🎯 **BENEFITS**

### **✅ For Developers:**
- Single codebase for all platforms
- Easy to add new platforms
- Platform-agnostic business logic
- Clean separation of concerns

### **✅ For Users:**
- Choose your preferred platform
- Switch platforms anytime
- Same features on all platforms
- Consistent user experience

### **✅ For Business:**
- Reduce development time
- Easy to test new platforms
- Future-proof architecture
- Scalable design

---

## 🚀 **FUTURE PLATFORMS**

### **Coming Soon:**
- 📸 **Instagram** - Stories, polls, DMs
- 📘 **Facebook** - Groups, pages, polls
- 💬 **Discord** - Servers, channels, reactions
- 👻 **Snapchat** - Stories, groups
- 🐦 **Twitter/X** - Tweets, polls, DMs

---

## 📝 **EXAMPLE USE CASES**

### **Use Case 1: Multi-Platform Engagement**

```javascript
// Morning: Telegram
ENGAGEMENT_PLATFORM=telegram

// Afternoon: Instagram Stories
await EngagementSystem.switchPlatform('instagram');

// Evening: Facebook Group
await EngagementSystem.switchPlatform('facebook');
```

### **Use Case 2: A/B Testing**

```javascript
// Test engagement on different platforms
const telegramStats = await testPlatform('telegram');
const whatsappStats = await testPlatform('whatsapp');

// Choose best performing platform
if (telegramStats.engagement > whatsappStats.engagement) {
    await EngagementSystem.switchPlatform('telegram');
}
```

### **Use Case 3: Platform Failover**

```javascript
// If Telegram is down, automatically switch to WhatsApp
try {
    await EngagementSystem.sendMessage(message);
} catch (error) {
    logger.warn('Telegram failed, switching to WhatsApp');
    await EngagementSystem.switchPlatform('whatsapp');
    await EngagementSystem.sendMessage(message);
}
```

---

## 🎉 **CONCLUSION**

This unified engagement system provides:
- ✅ **Flexibility** - Choose any platform
- ✅ **Scalability** - Easy to add new platforms
- ✅ **Maintainability** - Single codebase
- ✅ **Reliability** - Platform-agnostic business logic

**Your betting pool engagement system is now future-proof and ready for any social media platform!** 🚀





