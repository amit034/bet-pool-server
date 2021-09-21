'use strict';
const _ = require('lodash');
const moment = require('moment');
const {Game, Team, Sequelize} = require('../models');
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
    createGame(data, {transaction}) {
        return Game.create(data, {transaction});
    },
    async updateGame(data, {transaction}) {
        const query = {
            status: {[Op.ne]: 'FINISHED'},
            id: data.id,
        };
        const game = await Game.findOne({where: query, transaction});
        return game.update({score1: data.result.score1, score2: data.result.score2, status: data.status}, {transaction});
    }
};