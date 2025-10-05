'use strict';
const schedule = require('node-schedule');
// const bots = require('../bots'); // Temporarily disabled to fix circular dependency
const _ = require('lodash');

module.exports = {
    start() {
        // Temporarily disabled to fix circular dependency
        // schedule.scheduleJob('* * * * *', async() => {
        //     return Promise.all(_.map(bots, async(bot) => {
        //         return bot.bet();
        //     }));
        // });

        // schedule.scheduleJob('* * * * *', async() => {
        //     return bots.monkeyBot.bet(true);
        // });
    },

};