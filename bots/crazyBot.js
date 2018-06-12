'use strict';
const _ = require('lodash');
const mongoose = require('mongoose');
const util = require('util');
const Bot = require('./bot');
const GameRepository = require('../repositories/gameRepository');
const ChallengeRepository = require('../repositories/challengeRepository');
const BetRepository = require('../repositories/betRepository');
const gameRepository = new GameRepository();
const challengeRepository = new ChallengeRepository();
const repository = new BetRepository();
function CrazyBot() {
    this.name = 'smartBot';
}

CrazyBot.prototype.bet = function (challengeModel) {
    if (!this.userId) return;
    return Promise.all([
        gameRepository.findById(challengeModel.refId),
        repository.findByChallengeId(challengeModel._id)
        ]).then(([game, bets]) => {
           const myBet = _.find(bets,{participate: this.userId});
            if (myBet) return myBet;
            const home =  _.get(game, 'odds.home', 1);
            const away =  _.get(game, 'odds.away', 1);
            const draw =  _.get(game, 'odds.draw' ,1);
            const odds = [home, away, draw];
            const min = _.min(odds);
            const min2 = _.min(_.without(odds, min));
            const score1Avg = home == min? min/min2 : min2/min;
            const score2Avg = away == min? min/min2 : min2/min;
            const score1 = _.isNaN(score1Avg) ? 0 : _.round(score1Avg);
            const score2 = _.isNaN(score1Avg)? 0 : _.round(score2Avg);
            return {challenge: challengeModel._id, pool: mongoose.Types.ObjectId('55cdcdc780d1afee6c4d5fdb'), participate: this.userId, score1, score2};
        }).then((bet) => {
            if (_.isPlainObject(bet)){
                return repository.createOrUpdate(bet);
            }
            return bet;


        })
};

util.inherits(CrazyBot, Bot);

module.exports = CrazyBot;