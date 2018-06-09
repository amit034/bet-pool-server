'use strict';
const schedule = require('node-schedule');
const logger = require('../utils/logger');
const bots = require('../bots');
const _ = require('lodash');
const moment = require('moment');
const GameRepository = require('../repositories/gameRepository');
const gameRepository = new GameRepository();
let activeBots = [];
module.exports = {

    start() {
        Promise.all(_.map(bots, (bot) => {
            return bot.init();
        })).then((bots) => {
            activeBots = _.reject(bots, _.isNull);
            schedule.scheduleJob('*/1 * * * *', () => {
                return gameRepository.findGameByQuery({playAt: {$lte: moment().add(6, 'days')}, status: {$ne: 'FINISHED'}})
                .then((games)=> {
                    return Promise.all(_.map(games, (game) => {
                        return Promise.all(_.map(activeBots , (bot) => {
                            return bot.bet(game);
                        }));
                    }));
                }).catch((err) => {
                   logger.log('error', err);
               });
            })
        }).catch((err) => {
            logger.log('error', err);
        });
    }
};