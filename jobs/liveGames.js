'use strict';
const schedule = require('node-schedule');
const logger = require('../utils/logger');
const moment = require('moment');
const _ = require('lodash');
const sqlModules = require('../mysql_models');
const { Op } = require("sequelize");
const apiFootballSdk = require('../lib/apiFootballSDK');
const {Game: GameSql} = sqlModules;
const NOW = moment.tz('Israel');
const TODAY_START =  moment.tz('Israel').startOf('day').subtract(4, 'hours');
module.exports = {

    start() {
        schedule.scheduleJob('*/1 * * * *', async () => {
            const activeGames = await GameSql.findAll({
                where: {
                    playAt: {[Op.gt]: TODAY_START, [Op.lt]: NOW},
                    openFbId: {[Op.ne]: null},
                    status: {[Op.or]: {[Op.ne]: 'FINISHED', [Op.eq]: null}}
                }
            });
            return _.reduce(activeGames, (prev, game) => {
                return prev.then(async () => {
                    const {match} = await apiFootballSdk.getMatch(game.openFbId);
                    const {status, score: {fullTime: {homeTeam, awayTeam}}} = match;
                    if(game.status !== status || game.score1 !== _.toString(homeTeam) || game.score2 !== _.toString(awayTeam)){
                        game.set('status', status);
                        game.set('score1', homeTeam);
                        game.set('score2', awayTeam);
                        await game.save();
                    }
                    return Promise.resolve();
                }).catch((e) => {
                    logger.log(e);
                    return Promise.resolve();
                });
            }, Promise.resolve());
        });
    }
};

