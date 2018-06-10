'use strict';
const _ = require('lodash');
const util = require('util');
const Bot = require('./bot');
const GameRepository = require('../repositories/gameRepository');
const repository = new GameRepository();

function CrazyBot() {
    this.name = 'smartBot';
}

CrazyBot.prototype.bet = function (gameModel) {
    if (!this.userId) return;
    return repository.findById(gameModel._id)
        .then((game) => {
            const home =  _.get(game, 'odds.home', 1);
            const away =  _.get(game, 'odds.away', 1);
            const draw =  _.get(game, 'odds.draw' ,1);
            const odds = [home, away, draw];
            const min = _.min(odds);
            const min2 = _.min(_.reject(odds, min));
            const score1Avg = home == min? min/min2 : min2/min;
            const score2Avg = away == min? min/min2 : min2/min;
            const score1 = _.isNaN(score1Avg) ? 0 : _.round(score1Avg);
            const score2 = _.isNaN(score1Avg)? 0 : _.round(score2Avg);
            return {game: gameModel._id, pool: '55cdcdc780d1afee6c4d5fdb', participate: this.userId, score1, score2};
        }).then((bet) => {
            return repository.createOrUpdate(bet);
        })
};

util.inherits(CrazyBot, Bot);

module.exports = CrazyBot;