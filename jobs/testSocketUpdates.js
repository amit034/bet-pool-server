'use strict';

const schedule = require('node-schedule');
const logger = require('../utils/logger');

module.exports = {
    start(io) {
        console.log('🔄 Starting test Socket.io updates every 5 seconds...');
        
            // Schedule job to run every 10 seconds for one specific real challenge
            let currentScore1 = 0;
            let currentScore2 = 0;
            let challengeId = 203309; // Real challenge ID (Galatasaray SK vs Liverpool)
            let poolId = 23; // Pool 23 (Champion League 2025-2026)
            
            schedule.scheduleJob('*/15 * * * * *', () => {
                if (io) {
                    // Simulate one specific real challenge with incremental score changes
                    const scoreChange = Math.random();
                    
                    if (scoreChange > 0.7) {
                        // 30% chance to increase home team score
                        currentScore1++;
                    } else if (scoreChange > 0.4) {
                        // 30% chance to increase away team score  
                        currentScore2++;
                    }
                    // 40% chance no change
                    
                    const mockChallenge = {
                        id: challengeId, // Real challenge ID (Galatasaray SK vs Liverpool)
                        refId: poolId, // Pool 23
                        score1: currentScore1,
                        score2: currentScore2,
                        status: 'LIVE',
                        updatedAt: new Date().toISOString()
                    };

                    console.log('⏰ Test update sent for CHALLENGE', challengeId, '(Galatasaray SK vs Liverpool):', mockChallenge);
                    console.log('📊 Connected clients:', io.engine.clientsCount);
                    console.log('🏠 Rooms:', Object.keys(io.sockets.adapter.rooms));
                    
                    // Send to all connected clients
                    io.emit('updateChallenge', mockChallenge);
                    
                    // Also send to specific pool rooms if needed
                    io.to(poolId.toString()).emit('updateChallenge', mockChallenge);
                } else {
                    console.log('❌ Socket.io not available for test updates');
                }
            });
    }
};
