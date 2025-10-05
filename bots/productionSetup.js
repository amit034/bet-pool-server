#!/usr/bin/env node

/**
 * Production WhatsApp Bot Setup Script
 * This script helps set up the WhatsApp bot for production deployment on AWS
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 WhatsApp Bot Production Setup');
console.log('━'.repeat(60));

// Check if we're in production environment
const isProduction = process.env.NODE_ENV === 'production';
const isAWS = process.env.AWS_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME;

console.log(`📋 Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`☁️  AWS Detected: ${isAWS ? 'Yes' : 'No'}`);

// Configuration for production
const productionConfig = {
    // Session management
    sessionPath: './.wwebjs_auth',
    backupPath: './whatsapp-session-backup',
    
    // AWS specific settings
    headless: true, // Always headless on server
    noSandbox: true, // Required for AWS/Docker
    
    // Chrome path for different environments
    chromePaths: {
        aws: '/usr/bin/google-chrome-stable',
        ubuntu: '/usr/bin/google-chrome',
        centos: '/usr/bin/google-chrome-stable',
        docker: '/usr/bin/google-chrome-stable',
        macos: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    }
};

// Function to detect Chrome installation
function detectChrome() {
    const paths = Object.values(productionConfig.chromePaths);
    
    for (const chromePath of paths) {
        if (fs.existsSync(chromePath)) {
            console.log(`✅ Chrome found at: ${chromePath}`);
            return chromePath;
        }
    }
    
    console.log('⚠️  Chrome not found in standard locations');
    return null;
}

// Function to create production config
function createProductionConfig() {
    const chromePath = detectChrome();
    
    const config = `module.exports = {
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
        chromePath: "${chromePath || '/usr/bin/google-chrome-stable'}",
        sessionPath: "${productionConfig.sessionPath}",
        
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
        path: "${productionConfig.backupPath}"
    }
};`;

    const configPath = path.join(__dirname, '../config/whatsapp-production.js');
    fs.writeFileSync(configPath, config);
    console.log(`✅ Production config created: ${configPath}`);
}

// Function to create deployment script
function createDeploymentScript() {
    const deployScript = `#!/bin/bash

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
`;

    const scriptPath = path.join(__dirname, '../deploy-aws.sh');
    fs.writeFileSync(scriptPath, deployScript);
    fs.chmodSync(scriptPath, '755');
    console.log(`✅ Deployment script created: ${scriptPath}`);
}

// Function to create session backup utility
function createSessionBackup() {
    const backupScript = `#!/usr/bin/env node

/**
 * WhatsApp Session Backup Utility
 * Backs up authentication session for disaster recovery
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sessionPath = './.wwebjs_auth';
const backupPath = './whatsapp-session-backup';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

if (fs.existsSync(sessionPath)) {
    const backupName = \`session-backup-\${timestamp}\`;
    const fullBackupPath = path.join(backupPath, backupName);
    
    // Create backup directory
    fs.mkdirSync(fullBackupPath, { recursive: true });
    
    // Copy session files
    execSync(\`cp -r \${sessionPath}/* \${fullBackupPath}/\`);
    
    console.log(\`✅ Session backed up to: \${fullBackupPath}\`);
    
    // Keep only last 5 backups
    const backups = fs.readdirSync(backupPath)
        .filter(name => name.startsWith('session-backup-'))
        .sort()
        .reverse();
    
    if (backups.length > 5) {
        backups.slice(5).forEach(oldBackup => {
            const oldPath = path.join(backupPath, oldBackup);
            execSync(\`rm -rf \${oldPath}\`);
            console.log(\`🗑️  Removed old backup: \${oldBackup}\`);
        });
    }
} else {
    console.log('⚠️  No session found to backup');
}
`;

    const backupScriptPath = path.join(__dirname, 'backupSession.js');
    fs.writeFileSync(backupScriptPath, backupScript);
    fs.chmodSync(backupScriptPath, '755');
    console.log(`✅ Session backup utility created: ${backupScriptPath}`);
}

// Main setup process
console.log('\n📦 Creating production files...\n');

createProductionConfig();
createDeploymentScript();
createSessionBackup();

console.log('\n🎯 Production Setup Complete!\n');

console.log('📋 Next Steps for AWS Deployment:');
console.log('1. Upload your project to AWS EC2 instance');
console.log('2. Run: chmod +x deploy-aws.sh && ./deploy-aws.sh');
console.log('3. SSH into server and scan QR code when prompted');
console.log('4. Bot will run automatically with PM2');
console.log('5. Set up session backups with cron job');

console.log('\n⚠️  Important Notes:');
console.log('• Session expires every 2-4 weeks typically');
console.log('• Monitor logs: pm2 logs whatsapp-tournament-bot');
console.log('• Backup sessions regularly');
console.log('• Use CloudWatch for AWS monitoring');

console.log('\n🔧 Environment Variables to Set on AWS:');
console.log('export WHATSAPP_GROUP_ID="120363418993607043@g.us"');
console.log('export WHATSAPP_ADMIN_NUMBERS="972528558707"');
console.log('export WHATSAPP_DAILY_TIME="09:00"');
console.log('export WHATSAPP_TIMEZONE="Asia/Jerusalem"');

