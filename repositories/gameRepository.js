'use strict';
const _ = require('lodash');
const moment = require('moment');
const {Game, Team, Event, Sequelize} = require('../models');
const {Op} = Sequelize;

module.exports = {
    findGameById(gameId, {transaction}) {
        return Game.findByPk(gameId, {transaction});
    },
    findGameByQuery(query, {transaction}) {
        return Game.findOne({where: query, transaction});
    },
    findGamesByEventIds(eventIds, active, {transaction} = {}) {
        const query = {eventId: eventIds};
        if (active) {
            query.playAt = {[Op.gte]: moment()};
        } else if (active === false) {
            query.playAt = {[Op.lt]: moment()};
        }
        return Game.findAll({where: query, transaction});
    },
    findGameByIds(gameIds, {transaction}) {
        return Game.findAll({where: {gameId: gameIds}, transaction});
    },
    findActiveGameByIds(gameIds, {transaction}) {
        return Game.findAll({where: {gameId: gameIds, playAt: {[Op.gte]: moment()}},transaction});
    },
    findActive({transaction}) {
        return Game.findAll({
            where: {playAt: {[Op.gte]: moment()}} ,
            include: [{model: Team, as: 'homeTeam'},{model: Team, as: 'awayTeam'}],
            transaction});
    },
    findLive({transaction}) {
        return Game.findAll({
            where: {
                playAt: {[Op.lte]: moment()},
                status: {[Op.ne]: 'FINISHED'},
                fapiId: {[Op.gt]: 0}
            },
            include: [{
                model: Event,
                as: 'event',
                where: {
                    fapiId: {[Op.gt]: 0}
                }
            }],
            transaction});
    },
    async findOrCreate(data, {transaction}) {
        const {eventId, homeTeamId, awayTeamId} = data;
        const query  = {eventId, homeTeamId, awayTeamId};
        const game = await Game.findOne({where: query, transaction});
        return !_.isNil(game) ? game : Game.create(_.assign({}, data, query), {transaction});
    },
    async updateScore({id, score1, score2, status}, {transaction}) {
        const query = {
            status: {[Op.ne]: 'FINISHED'},
            id,
        };
        const game = await Game.findOne({where: query, transaction});
        if(game) {
            return game.update({score1, score2, status}, {transaction});
        }
        return Promise.resolve()
    }
};