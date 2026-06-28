'use strict';
const schedule = require('node-schedule');
const bots = require('../bots');

// When a game starts, find pool participants who forgot to bet and place
// the same bet monkey bot (userId 2) placed for that pool/challenge.
module.exports = {
    start() {
        schedule.scheduleJob('*/5 * * * *', async() => {
            return bots.monkeyBot.bet(true);
        });
    },
};
