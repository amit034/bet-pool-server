'use strict';
const mongoose = require('mongoose');
const _ = require('lodash');
const util = require('util');
const Bot = require('./bot');
const GameRepository = require('../repositories/gameRepository');
const BetRepository = require('../repositories/betRepository');
const gameRepository = new GameRepository();
const repository = new BetRepository();

function SmartBot() {
    this.name = 'smartBot';
}

SmartBot.prototype.bet = function (challengeModel) {
    if (!this.userId) return;
    return Promise.all([
        gameRepository.findById(challengeModel.refId),
        repository.findByChallengeId(challengeModel._id)
    ]).then(([game, bets]) => {
            const myBet = _.find(bets,{participate: this.userId});
            if (myBet) return myBet;
            const home =  _.get(game, 'odds.home', 1);
            const away =  _.get(game, 'odds.home', 1);
            const score1Avg = away / home ;
            const score2Avg = home / away;
            const score1 = _.isNaN(score1Avg) ? 0 : _.round(score1Avg);
            const score2 = _.isNaN(score1Avg)? 0 : _.round(score2Avg);
            return {challenge: challengeModel._id, pool: mongoose.Types.ObjectId('55cdcdc780d1afee6c4d5fdb'), participate: this.userId, score1, score2};
        }).then((bet) => {
            if (_.isPlainObject(bet)) {
                return repository.createOrUpdate(bet);
            }
            return bet;
        })
};

util.inherits(SmartBot, Bot);

module.exports = SmartBot;