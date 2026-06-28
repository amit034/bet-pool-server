'use strict';
const schedule = require('node-schedule');
const bots = require('../bots');

module.exports = {
    start() {
        // Monkey bot places its own bets 24 hours before each game
        schedule.scheduleJob('10 * * * *', async() => {
            return bots.monkeyBot.bet(false);
        });

        // Smart bot uses odds + historical outcomes, runs after monkey bot
        schedule.scheduleJob('15 * * * *', async() => {
            return bots.smartBot.bet(false);
        });

        // Crowd bot reflects the crowd's consensus, runs after monkey + smart have voted
        schedule.scheduleJob('20 * * * *', async() => {
            return bots.crowdBot.bet(false);
        });
    },
};