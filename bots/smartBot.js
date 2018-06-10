'use strict';
const _ = require('lodash');
const util = require('util');
const Bot = require('./bot');
const GameRepository = require('../repositories/gameRepository');
const repository = new GameRepository();

function SmartBot() {
    this.name = 'smartBot';
}

SmartBot.prototype.bet = function (gameModel) {
    if (!this.userId) return;
    return repository.findById(gameModel._id)
        .then((game) => {
            const home =  _.get(game, 'odds.home', 1);
            const away =  _.get(game, 'odds.home', 1);
            const score1Avg = away / home ;
            const score2Avg = home / away;
            const score1 = _.isNaN(score1Avg) ? 0 : _.round(score1Avg);
            const score2 = _.isNaN(score1Avg)? 0 : _.round(score2Avg);
            return {game: gameModel._id, pool: '55cdcdc780d1afee6c4d5fdb', participate: this.userId, score1, score2};
        }).then((bet) => {
            return repository.createOrUpdate(bet);
        })
};

util.inherits(SmartBot, Bot);

module.exports = SmartBot;