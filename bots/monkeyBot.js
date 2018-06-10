'use strict';
const _ = require('lodash');
const util = require('util');
const Bot = require('./bot');
const GameRepository = require('../repositories/gameRepository');
const repository = new GameRepository();

function MonkeyBot() {
    this.name = 'monkeyBot';
}

MonkeyBot.prototype.bet = function (gameModel) {
    if (!this.userId) return;
    return repository.findGameByQuery({event: gameModel.event})
    .then((games) => {
        const score1Avg = _.sumBy(games, 'score1') / _.size(games);
        const score2Avg = _.sumBy(games, 'score2') / _.size(games);
        const score1 = _.isNaN(score1Avg) ? 0 : _.round(score1Avg);
        const score2 = _.isNaN(score1Avg) ? 0 : _.round(score2Avg);
        return {game: gameModel._id, pool: '55cdcdc780d1afee6c4d5fdb', participate: this.userId, score1, score2};
    }).then((bet) => {
        return repository.createOrUpdate(bet);
    })
};

util.inherits(MonkeyBot, Bot);

module.exports = MonkeyBot;