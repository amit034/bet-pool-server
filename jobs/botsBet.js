'use strict';
const schedule = require('node-schedule');
const bots = require('../bots');
const _ = require('lodash');

module.exports = {
    start() {
        schedule.scheduleJob('* * * * *', async() => {
            // return Promise.all(_.map(bots, async(bot) => {
            //     return bot.bet();
            // }));
            return bots.crazyBot.bet();
        });

        // schedule.scheduleJob('*/1 * * * *', async() => {
        //     return bots.monkeyBot.betForOthers();
        // });
    },

};