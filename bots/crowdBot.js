'use strict';
const mongoose = require('mongoose');
const _ = require('lodash');
const util = require('util');
const Bot = require('./bot');
const repository = require('../repositories/betRepository');

function CrowdBot() {
    this.name = 'crowdBot';
    this.id = 4;
}

CrowdBot.prototype.bet = function (challengeModel) {
    if (!this.userId) return;
    return repository.findByChallengeId(challengeModel._id)
        .then((bets = []) => {
            const myBet = _.find(bets,{participate: this.userId});
            if (myBet) return myBet;
            const score1Avg = _.sumBy(bets, 'score1') / _.size(bets) ;
            const score2Avg = _.sumBy(bets, 'score2') / _.size(bets);
            const score1 = _.isNaN(score1Avg) ? 0 : _.round(score1Avg);
            const score2 = _.isNaN(score1Avg)? 0 : _.round(score2Avg);
            return {challenge: challengeModel._id, pool: mongoose.Types.ObjectId('55cdcdc780d1afee6c4d5fdb'), participate: this.userId, score1, score2, public: true};
        }).then((bet) => {
            if (_.isPlainObject(bet)){
                return repository.createOrUpdate(bet);
            }
            return bet;
        })
};

util.inherits(CrowdBot, Bot);

module.exports = CrowdBot;

