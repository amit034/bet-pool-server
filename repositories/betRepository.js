var Bet = require('../models/Bet');
var Q = require('q');

function BetRepository() {
	this.createOrUpdate = createOrUpdate;
	this.findUserBetsByPoolId = findUserBetsByPoolId;
}


function findUserBetsByPoolId(userId , poolId) {
	var query  = {participate :userId , pool: poolId};
	return Bet.find(query).populate('game').exec();
}

function createOrUpdate(poolId,participateId, gameId,score1,score2) {
	var deferred = Q.defer();
    var query  = {participate :participateId , game: gameId, pool: poolId};
    Bet.findOneAndUpdate(query, {'score1': score1 , 'score2':score2},{'upsert':true},function(err, bet) {
		if (err) {
			deferred.reject(new Error(err));
		}
		else {
			deferred.resolve(bet);
		}
	});
	return deferred.promise;
}

module.exports = BetRepository;
