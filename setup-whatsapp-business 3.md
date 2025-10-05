# WhatsApp Business API Setup Guide

Complete guide to set up WhatsApp Business API for **permanent authentication** with a **separate business account**.

## 🎯 What You'll Get

✅ **Separate business WhatsApp account** (not your personal account)  
✅ **Custom business name** (e.g., "Tournament Bot")  
✅ **PERMANENT authentication** - no QR codes ever  
✅ **Professional messaging features**  
✅ **Reliable API access**  

## 📋 Prerequisites

### Required Items:
- **Business phone number** (dedicated for the bot)
- **Business registration documents**
- **Facebook Business Manager account**
- **Valid business website or profile**
- **$10-20/month budget** for messages

### Recommended Approach:
**Meta Cloud API** (Official WhatsApp solution)

## 🚀 Step-by-Step Setup

### Step 1: Create Facebook Business Manager Account

1. Go to [business.facebook.com](https://business.facebook.com)
2. Click "Create Account"
3. Enter your business information
4. Verify your business email
5. Add your business details

### Step 2: Set Up WhatsApp Business API

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "My Apps" → "Create App"
3. Choose "Business" app type
4. Enter app details:
   - **App Name**: "Tournament Bot"
   - **App Purpose**: "Business messaging"
   - **Business Manager**: Select your business

### Step 3: Add WhatsApp Product

1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. Select your Business Manager account
4. Create or select WhatsApp Business Account

### Step 4: Get Phone Number

**Option A: Use Existing Business Number**
- Must be a business phone number
- Cannot be registered with personal WhatsApp

**Option B: Get New Number**
- Google Voice: $10/month
- Twilio Phone Number: $1/month
- Any business VoIP service

### Step 5: Add Phone Number to WhatsApp

1. In WhatsApp dashboard, go to "Phone Numbers"
2. Click "Add phone number"
3. Enter your business phone number
4. Choose verification method (SMS or call)
5. Enter verification code
6. Set display name: "Tournament Bot"

### Step 6: Get API Credentials

1. Go to "API Setup" in WhatsApp dashboard
2. Copy these values:
   - **Access Token** (permanent token)
   - **Phone Number ID**
   - **Business Account ID**

### Step 7: Business Verification

1. Go to Business Manager → Business Settings
2. Click "Business Info"
3. Upload required documents:
   - Business license/registration
   - Tax ID document
   - Proof of address
4. Wait 1-7 days for approval

### Step 8: Configure Your Bot

Create environment variables:

```bash
# WhatsApp Business API Configuration
export WHATSAPP_ACCESS_TOKEN="your_permanent_access_token_here"
export WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id_here"
export WHATSAPP_BUSINESS_ACCOUNT_ID="your_business_account_id_here"

# Group and messaging settings  
export WHATSAPP_BUSINESS_GROUP_ID="your_group_id_here"
export WHATSAPP_DAILY_TIME="09:00"
export WHATSAPP_TIMEZONE="Asia/Jerusalem"
export WHATSAPP_ADMIN_NUMBERS="972528558707"
export WHATSAPP_BUSINESS_BOT_ENABLED="true"

# Webhook settings (for receiving messages)
export WHATSAPP_WEBHOOK_VERIFY_TOKEN="your_webhook_verify_token"
export WHATSAPP_WEBHOOK_URL="https://yourserver.com/webhook/whatsapp"
```

### Step 9: Set Up Webhook (Optional)

For receiving messages:

1. In WhatsApp dashboard, go to "Configuration"
2. Add webhook URL: `https://yourserver.com/webhook/whatsapp`
3. Add verify token (create a random string)
4. Subscribe to "messages" events

### Step 10: Test Your Bot

```bash
# Install axios if not already installed
npm install axios

# Start your bot
node bots/whatsappBusinessBot.js
```

## 💰 Cost Breakdown

### Setup Costs:
- Business phone number: $1-10/month
- No other setup fees

### Usage Costs (WhatsApp charges):
- **Conversations**: Free for first 1,000/month
- **Business-initiated messages**: $0.005-0.05 each
- **User-initiated conversations**: Free for 24 hours

### Monthly Estimate:
- **Daily announcements**: ~$1.50/month (100 users)
- **User interactions**: ~$5-15/month  
- **Total**: ~$10-20/month

## 🔧 Integration with Your Project

Add to your `bots/index.js`:

```javascript
const WhatsAppBusinessBot = require('./whatsappBusinessBot');

module.exports = {
    // Existing bots
    crowdBot: new CrowdBot(),
    monkeyBot: new MonkeyBot(),
    smartBot: new SmartBot(),
    crazyBot: new CrazyBot(),
    
    // WhatsApp bots
    whatsappTournamentBot: whatsappBotManager, // Web.js version (QR codes)
    whatsappBusinessBot: new WhatsAppBusinessBot() // Business API (permanent)
};
```

## 🚀 Deployment

### For AWS/Production:

```bash
# Set environment variables on server
export WHATSAPP_ACCESS_TOKEN="your_token"
export WHATSAPP_PHONE_NUMBER_ID="your_id"
# ... other variables

# Start with PM2
pm2 start bots/whatsappBusinessBot.js --name "whatsapp-business-bot"
pm2 save
pm2 startup
```

## ✅ Verification Checklist

- [ ] Facebook Business Manager account created
- [ ] WhatsApp Business API app created  
- [ ] Business phone number added and verified
- [ ] Access token and credentials obtained
- [ ] Business verification submitted
- [ ] Environment variables configured
- [ ] Bot tested and working
- [ ] Webhook configured (optional)
- [ ] Production deployment completed

## 🆘 Troubleshooting

### Common Issues:

**"Phone number already registered"**
- Use a different business phone number
- Cannot use personal WhatsApp numbers

**"Business verification pending"**
- Wait 1-7 days for approval
- Bot still works during verification

**"API calls failing"**
- Check access token is correct
- Verify phone number ID
- Check rate limits (1000 requests/hour)

**"Messages not sending"**
- Verify recipient number format (+1234567890)
- Check message template compliance
- Ensure business is verified

### Getting Help:

- **WhatsApp Support**: [developers.facebook.com/support](https://developers.facebook.com/support)
- **Documentation**: [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)
- **Community**: [stackoverflow.com/questions/tagged/whatsapp-business-api](https://stackoverflow.com/questions/tagged/whatsapp-business-api)

## 🎉 Success!

Once set up, you'll have:

✅ **Permanent WhatsApp bot** that never needs QR codes  
✅ **Separate business identity** (not your personal account)  
✅ **Professional messaging** with your custom business name  
✅ **Reliable service** backed by Meta/WhatsApp  
✅ **Same features** as your current bot but better  

**Total setup time**: 2-4 hours + 1-7 days verification  
**Monthly cost**: ~$10-20  
**Authentication**: Permanent (never expires!)

