# WhatsApp Tournament Administrator Bot

A WhatsApp bot that acts as a **tournament administrator and announcer**, not as a betting participant. This bot manages tournament communication, sends game announcements, and provides information to tournament participants.

## 🎯 Bot Role

**Important**: This is NOT a betting bot. The existing bots in this project (`crowdBot.js`, `monkeyBot.js`, etc.) are betting bots that act like regular users placing bets. The WhatsApp bot is different - it's an **administrator/announcer** that manages tournament communication.

## ✨ Features

### 🤖 Automatic Features
- **Daily Game Announcements**: Sends today's games every morning at a configured time
- **Auto-reconnection**: Automatically reconnects if WhatsApp Web session is lost
- **Persistent Session**: Maintains WhatsApp Web authentication across restarts

### 💬 User Commands
- `games` or `matches` - Get upcoming games (next 7 days)
- `today` - Get today's games
- `tomorrow` - Get tomorrow's games  
- `standings` - Tournament leaderboard (coming soon)
- `status` - Tournament status information
- `help` - Show available commands

### 👨‍💼 Admin Commands (for authorized numbers only)
- `/admin announce <message>` - Send announcement to group
- `/admin games [days]` - Send upcoming games announcement
- `/admin today` - Send today's games announcement  
- `/admin status` - Get bot status

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install whatsapp-web.js qrcode-terminal moment-timezone
```

### 2. Set Environment Variables
```bash
export WHATSAPP_GROUP_ID="your_group_id_here"
export WHATSAPP_DAILY_TIME="09:00"
export WHATSAPP_TIMEZONE="Asia/Jerusalem"
export WHATSAPP_ADMIN_NUMBERS="972501234567,972501234568"
```

### 3. Start the Bot
```bash
npm run start-whatsapp-bot
```

### 4. Scan QR Code
When you first run the bot, it will display a QR code. Scan it with WhatsApp to authenticate.

## ⚙️ Configuration

### Required Configuration
- `WHATSAPP_GROUP_ID`: The WhatsApp group ID where bot sends messages
- `WHATSAPP_DAILY_TIME`: Time for daily announcements (HH:mm format)
- `WHATSAPP_TIMEZONE`: Timezone for scheduling

### Optional Configuration
- `WHATSAPP_BOT_ENABLED`: Enable/disable bot (default: true)
- `WHATSAPP_AUTO_RECONNECT`: Auto-reconnect on disconnect (default: true)
- `WHATSAPP_MAX_RETRIES`: Max reconnection attempts (default: 3)
- `WHATSAPP_ADMIN_NUMBERS`: Comma-separated admin phone numbers
- `WHATSAPP_USE_EMOJIS`: Use emojis in messages (default: true)

### Getting Group ID
1. Add the bot to your WhatsApp group
2. Send a message to the group
3. Check bot logs for the chat ID (format: `120363043968066787@g.us`)

## 📁 File Structure

```
bots/
├── whatsappTournamentBot.js     # Main bot class
├── whatsappBotManager.js        # Bot lifecycle manager
├── startWhatsAppBot.js          # Startup script
└── README-WhatsApp.md           # This file

config/
└── whatsapp-config.template.js  # Configuration template
```

## 🔧 Production Deployment

### 1. Environment Setup
```bash
# Copy and configure the template
cp config/whatsapp-config.template.js config/whatsapp-config.js
# Edit the file with your settings
```

### 2. Process Management
Use PM2 or similar for process management:
```bash
pm2 start bots/startWhatsAppBot.js --name "whatsapp-tournament-bot"
pm2 save
pm2 startup
```

### 3. Server Requirements
- Node.js 14+ 
- Chrome/Chromium for Puppeteer
- Stable internet connection
- Persistent storage for WhatsApp session

### 4. Security Considerations
- Keep WhatsApp session files secure
- Restrict admin phone numbers
- Monitor logs for unauthorized access attempts
- Use environment variables for sensitive config

## 🐛 Troubleshooting

### Bot Won't Connect
- Check internet connection
- Verify Chrome/Chromium is installed
- Clear session data: `rm -rf ./whatsapp-tournament-session`
- Restart and scan QR code again

### Messages Not Sending
- Verify group ID is correct
- Check bot is added to the group
- Ensure WhatsApp Web session is active
- Check logs for error messages

### Daily Messages Not Working
- Verify timezone configuration
- Check scheduled time format (HH:mm)
- Ensure bot has been running continuously
- Check system time is correct

## 📊 Monitoring

### Log Files
Check logs for bot activity:
```bash
tail -f logs/api.log | grep "WhatsApp"
```

### Status Endpoint
The bot manager provides status information:
```javascript
const whatsappBotManager = require('./bots/whatsappBotManager');
console.log(whatsappBotManager.getStatus());
```

## 🤝 Integration with Tournament System

The bot integrates with your existing tournament system:
- Uses `gameRepository` to fetch games
- Uses `teamRepository` to get team names  
- Uses `eventRepository` for tournament events
- Leverages existing database models and repositories

## 📝 Example Messages

### Daily Announcement
```
🌅 Good morning, tournament participants!

🏆 Today's Games

📅 Monday, September 15th
⚽ 15:00 - Real Madrid vs Barcelona
⚽ 18:00 - Liverpool vs Manchester City
```

### User Query Response
```
🏆 Upcoming Games (Next 7 days)

📅 Monday, September 15th  
⚽ 15:00 - Real Madrid vs Barcelona
⚽ 18:00 - Liverpool vs Manchester City

📅 Tuesday, September 16th
⚽ 20:00 - Arsenal vs Chelsea
```

## 🔄 Updates and Maintenance

- Regularly update dependencies: `npm update`
- Monitor WhatsApp Web API changes
- Check session validity periodically
- Backup configuration and session data
- Test in development environment first

## 📞 Support

For issues with:
- **Bot functionality**: Check logs and configuration
- **WhatsApp connectivity**: Clear session and re-authenticate  
- **Game data**: Verify database and API integration
- **Scheduling**: Check timezone and system time settings


