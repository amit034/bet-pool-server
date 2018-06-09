'use strict';
const _ = require('lodash');
const util = require('util');
const Bot = require('./bot');
const BetRepository = require('../repositories/betRepository');
const repository = new BetRepository();
let userId;

function CrowdBot() {
    this.name = 'crowdBot';
}

CrowdBot.prototype.bet = function (gameModel) {
    if (!this.userId) return;
    return repository.findByGameId(gameModel._id)
        .then((bets = []) => {
            const score1Avg = _.sumBy(bets, 'score1') / _.size(bets) ;
            const score2Avg = _.sumBy(bets, 'score2') / _.size(bets);
            const score1 = _.isNaN(score1Avg) ? 0 : _.round(score1Avg);
            const score2 = _.isNaN(score1Avg)? 0 : _.round(score2Avg);
            return {gameId: gameModel._id, pool: 0, participate: this.userId, score1, score2};
        }).then((bet) => {
            return repository.createOrUpdate(bet);
        })
};

util.inherits(CrowdBot, Bot);

module.exports = CrowdBot;

