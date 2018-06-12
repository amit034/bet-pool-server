'use strict';
const schedule = require('node-schedule');
const logger = require('../utils/logger');
const bots = require('../bots');
const _ = require('lodash');
const moment = require('moment');
const ChallengeRepository = require('../repositories/challengeRepository');
const challengeRepository = new ChallengeRepository();
let activeBots = [];
module.exports = {

    start() {
        Promise.all(_.map(bots, (bot) => {
            return bot.init();
        })).then((bots) => {
            activeBots = _.reject(bots, _.isNull);
            schedule.scheduleJob('*/1 * * * *', () => {
                return challengeRepository.findByQuery({playAt: {$lte: moment().add(5, 'min')}, status: {$ne: 'FINISHED'}})
                .then((challenges)=> {
                    return Promise.all(_.map(challenges, (challenge) => {
                        return Promise.all(_.map(activeBots , (bot) => {
                            return bot.bet(challenge);
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