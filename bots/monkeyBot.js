'use strict';
const _ = require('lodash');
const mongoose = require('mongoose');
const util = require('util');
const Bot = require('./bot');
const GameRepository = require('../repositories/gameRepository');
const BetRepository = require('../repositories/betRepository');
const gameRepository = new GameRepository();
const repository = new BetRepository();

function MonkeyBot() {
    this.name = 'monkeyBot';
}

MonkeyBot.prototype.bet = function (challengeModel) {
    if (!this.userId) return;
    return Promise.all([
        gameRepository.findGameByQuery({event: challengeModel.event}),
        repository.findByChallengeId(challengeModel._id)
    ]).then(([games, bets]) => {
        const myBet = _.find(bets,{participate: this.userId});
        if (myBet) return myBet;
        const score1Avg = _.sumBy(games, 'score1') / _.size(games);
        const score2Avg = _.sumBy(games, 'score2') / _.size(games);
        const score1 = _.isNaN(score1Avg) ? 0 : _.round(score1Avg);
        const score2 = _.isNaN(score1Avg) ? 0 : _.round(score2Avg);
        return {challenge: challengeModel._id, pool: mongoose.Types.ObjectId('55cdcdc780d1afee6c4d5fdb'), participate: this.userId, score1, score2, public: true};
    }).then((bet) => {
        if (_.isPlainObject(bet)) {
            return repository.createOrUpdate(bet);
        }
        return bet;
    })
};

util.inherits(MonkeyBot, Bot);

module.exports = MonkeyBot;