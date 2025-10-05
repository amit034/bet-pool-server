#!/usr/bin/env node

/**
 * Advanced WhatsApp Session Manager
 * Extends session life and automates re-authentication
 */

const fs = require('fs');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const logger = require('../utils/logger');

class AdvancedSessionManager {
    constructor(config = {}) {
        this.config = {
            sessionPath: './.wwebjs_auth',
            backupPath: './session-backups',
            keepAliveInterval: 5 * 60 * 1000, // 5 minutes
            sessionCheckInterval: 60 * 60 * 1000, // 1 hour
            maxSessionAge: 14 * 24 * 60 * 60 * 1000, // 14 days
            autoReauthenticate: true,
            notificationWebhook: process.env.WEBHOOK_URL,
            ...config
        };
        
        this.client = null;
        this.isAuthenticated = false;
        this.lastActivity = new Date();
        this.sessionAge = 0;
        this.keepAliveTimer = null;
        this.sessionCheckTimer = null;
    }

    async initialize() {
        logger.info('🔐 Initializing Advanced Session Manager...');
        
        // Check existing session age
        this.checkSessionAge();
        
        // Create client with extended session settings
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: "persistent-tournament-bot",
                dataPath: this.config.sessionPath
            }),
            puppeteer: {
                headless: true,
                executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--keep-alive-for-test', // Helps maintain connection
                    '--no-first-run'
                ]
            }
        });

        this.setupEventHandlers();
        this.startKeepAlive();
        this.startSessionMonitoring();
        
        await this.client.initialize();
    }

    setupEventHandlers() {
        this.client.on('qr', (qr) => {
            console.log('📱 New QR Code Required:');
            qrcode.generate(qr, { small: true });
            
            // Send notification about QR code requirement
            this.sendNotification('🔐 WhatsApp Bot requires QR code authentication', {
                type: 'qr_required',
                timestamp: new Date().toISOString()
            });
            
            logger.warn('QR code authentication required');
        });

        this.client.on('authenticated', () => {
            this.isAuthenticated = true;
            this.lastActivity = new Date();
            this.backupSession();
            
            logger.info('✅ WhatsApp authenticated successfully');
            this.sendNotification('✅ WhatsApp Bot authenticated successfully');
        });

        this.client.on('ready', () => {
            logger.info('🚀 WhatsApp Bot is ready and active');
            this.sendNotification('🚀 WhatsApp Bot is ready and active');
        });

        this.client.on('disconnected', (reason) => {
            this.isAuthenticated = false;
            logger.warn(`❌ WhatsApp disconnected: ${reason}`);
            
            // Attempt automatic reconnection
            if (this.config.autoReauthenticate) {
                this.attemptReconnection(reason);
            }
        });

        // Track activity to extend session
        this.client.on('message', () => {
            this.lastActivity = new Date();
        });
    }

    startKeepAlive() {
        // Send periodic keep-alive signals
        this.keepAliveTimer = setInterval(async () => {
            if (this.isAuthenticated) {
                try {
                    // Send a lightweight request to maintain session
                    await this.client.getState();
                    
                    // Send periodic status message to yourself (optional)
                    if (Math.random() < 0.1) { // 10% chance every 5 minutes
                        const statusMsg = `🤖 Bot Status: Active\nLast Activity: ${this.lastActivity.toLocaleString()}\nSession Age: ${Math.floor(this.sessionAge / (24 * 60 * 60 * 1000))} days`;
                        // Send to admin number as status update
                    }
                    
                    logger.info('💓 Keep-alive signal sent');
                } catch (error) {
                    logger.warn('Keep-alive failed:', error.message);
                }
            }
        }, this.config.keepAliveInterval);
    }

    startSessionMonitoring() {
        this.sessionCheckTimer = setInterval(() => {
            this.checkSessionHealth();
        }, this.config.sessionCheckInterval);
    }

    checkSessionAge() {
        const sessionPath = path.join(this.config.sessionPath, 'session-persistent-tournament-bot');
        
        if (fs.existsSync(sessionPath)) {
            const stats = fs.statSync(sessionPath);
            this.sessionAge = Date.now() - stats.mtime.getTime();
            
            const daysOld = Math.floor(this.sessionAge / (24 * 60 * 60 * 1000));
            logger.info(`📅 Session age: ${daysOld} days`);
            
            // Warn if session is getting old
            if (daysOld > 10) {
                logger.warn(`⚠️ Session is ${daysOld} days old - may need re-authentication soon`);
                this.sendNotification(`⚠️ WhatsApp session is ${daysOld} days old - may need re-authentication soon`);
            }
        }
    }

    async checkSessionHealth() {
        if (!this.isAuthenticated) return;
        
        try {
            // Check if client is still responsive
            const state = await this.client.getState();
            
            if (state !== 'CONNECTED') {
                logger.warn(`⚠️ WhatsApp state: ${state}`);
                
                if (state === 'UNPAIRED' || state === 'UNPAIRED_IDLE') {
                    this.sendNotification('🔐 WhatsApp session expired - QR code required');
                }
            }
            
            // Update session age
            this.checkSessionAge();
            
        } catch (error) {
            logger.error('Session health check failed:', error.message);
        }
    }

    async attemptReconnection(reason) {
        logger.info(`🔄 Attempting automatic reconnection... (Reason: ${reason})`);
        
        // Wait a bit before reconnecting
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        try {
            await this.client.initialize();
        } catch (error) {
            logger.error('Automatic reconnection failed:', error.message);
            this.sendNotification('❌ Automatic reconnection failed - manual intervention required');
        }
    }

    backupSession() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupDir = path.join(this.config.backupPath, `session-${timestamp}`);
            
            if (fs.existsSync(this.config.sessionPath)) {
                fs.mkdirSync(backupDir, { recursive: true });
                
                // Copy session files
                const { execSync } = require('child_process');
                execSync(`cp -r ${this.config.sessionPath}/* ${backupDir}/`);
                
                logger.info(`💾 Session backed up to: ${backupDir}`);
                
                // Clean old backups (keep last 10)
                this.cleanOldBackups();
            }
        } catch (error) {
            logger.error('Session backup failed:', error.message);
        }
    }

    cleanOldBackups() {
        try {
            if (!fs.existsSync(this.config.backupPath)) return;
            
            const backups = fs.readdirSync(this.config.backupPath)
                .filter(name => name.startsWith('session-'))
                .sort()
                .reverse();
            
            // Keep only last 10 backups
            if (backups.length > 10) {
                backups.slice(10).forEach(oldBackup => {
                    const oldPath = path.join(this.config.backupPath, oldBackup);
                    fs.rmSync(oldPath, { recursive: true, force: true });
                    logger.info(`🗑️ Removed old backup: ${oldBackup}`);
                });
            }
        } catch (error) {
            logger.error('Backup cleanup failed:', error.message);
        }
    }

    async sendNotification(message, data = {}) {
        // Log notification
        logger.info(`📢 Notification: ${message}`);
        
        // Send webhook notification if configured
        if (this.config.notificationWebhook) {
            try {
                const axios = require('axios');
                await axios.post(this.config.notificationWebhook, {
                    text: message,
                    data,
                    timestamp: new Date().toISOString(),
                    bot: 'whatsapp-tournament-bot'
                });
            } catch (error) {
                logger.error('Webhook notification failed:', error.message);
            }
        }
        
        // Could also send email, SMS, or other notifications here
    }

    // Method to extend session by simulating activity
    async extendSession() {
        if (!this.isAuthenticated) return;
        
        try {
            // Simulate activity to extend session
            await this.client.getChats();
            this.lastActivity = new Date();
            
            logger.info('🔄 Session extended through activity simulation');
        } catch (error) {
            logger.warn('Session extension failed:', error.message);
        }
    }

    // Method to get session status
    getSessionStatus() {
        const daysOld = Math.floor(this.sessionAge / (24 * 60 * 60 * 1000));
        const hoursIdle = Math.floor((Date.now() - this.lastActivity.getTime()) / (60 * 60 * 1000));
        
        return {
            authenticated: this.isAuthenticated,
            sessionAge: daysOld,
            hoursIdle,
            lastActivity: this.lastActivity.toISOString(),
            needsReauth: daysOld > 14
        };
    }

    async destroy() {
        // Clean up timers
        if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
        if (this.sessionCheckTimer) clearInterval(this.sessionCheckTimer);
        
        // Backup session before destroying
        if (this.isAuthenticated) {
            this.backupSession();
        }
        
        // Destroy client
        if (this.client) {
            await this.client.destroy();
        }
        
        logger.info('🛑 Advanced Session Manager destroyed');
    }
}

module.exports = AdvancedSessionManager;

