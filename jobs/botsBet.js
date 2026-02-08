'use strict';
const schedule = require('node-schedule');
const bots = require('../bots');
const _ = require('lodash');

module.exports = {
    start() {
        schedule.scheduleJob('55 * * * *', async() => {
            // return Promise.all(_.map(bots, async(bot) => {
            //     return bot.bet();
            // }));
        });

        schedule.scheduleJob('10 * * * *', async() => {
            return bots.monkeyBot.bet(true);
        });
    },

};