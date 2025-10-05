#!/bin/bash

# WhatsApp Bot AWS Deployment Script

echo "🚀 Deploying WhatsApp Tournament Bot to AWS..."

# Install Chrome on AWS Linux
sudo yum update -y
sudo yum install -y google-chrome-stable

# Or for Ubuntu/Debian:
# sudo apt-get update
# sudo apt-get install -y google-chrome-stable

# Set environment variables
export WHATSAPP_GROUP_ID="120363418993607043@g.us"
export WHATSAPP_DAILY_TIME="09:00"
export WHATSAPP_TIMEZONE="Asia/Jerusalem"
export WHATSAPP_ADMIN_NUMBERS="972528558707"
export NODE_ENV="production"

# Install dependencies
npm install

# First time setup (requires manual QR scan)
echo "🔐 Starting bot for first-time authentication..."
echo "📱 You'll need to scan the QR code via SSH or web interface"
npm run start-whatsapp-bot

# After authentication, use PM2 for production
npm install -g pm2
pm2 start bots/startWhatsAppBot.js --name "whatsapp-tournament-bot"
pm2 save
pm2 startup

echo "✅ Bot deployed successfully!"
echo "📊 Monitor with: pm2 status"
echo "📋 Logs with: pm2 logs whatsapp-tournament-bot"
