'use strict';
//const footballApi = require('./extractFootballApi');
const botsBet = require('./botsBet');
const migrateDb = require('./migrateDb');
const liveGames = require('./live-Games');
const autoGames = require('./auto-games');

// Import Unified Engagement System
const EngagementSystem = require('../engagement-system');

module.exports = {
    async start(io) {
        //autoGames.start();
        liveGames.start(io);
        //footballApi.start();
    //    botsBet.start();
   //     migrateDb.start();
        
        // Start Unified Engagement System (replaces WhatsApp Engagement Job)
        try {
            const started = await EngagementSystem.start();
            if (started) {
                const status = EngagementSystem.getStatus();
                console.log('✅ Unified Engagement System started successfully');
                console.log(`   Platform: ${status.platform}`);
                console.log(`   Pool ID: ${status.poolId}`);
                console.log('   System runs every minute checking for insights and polls');
            } else {
                console.log('ℹ️  Unified Engagement System not started (disabled or error)');
            }
        } catch (error) {
            console.error('❌ Failed to start Unified Engagement System:', error);
        }
    }
};