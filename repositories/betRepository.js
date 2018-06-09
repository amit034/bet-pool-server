const Q = require('q');
const mongoose = require('mongoose');
const Bet = require('../models/Bet');

function BetRepository() {
	this.createOrUpdate = createOrUpdate;
	this.findUserBetsByPoolId = findUserBetsByPoolId;
	this.findByGameId = findByGameId;
}


function findUserBetsByPoolId(userId , poolId) {
	const query  = {participate :userId , pool: poolId};
	return Bet.find(query).populate('game').exec();
}

function createOrUpdate(poolId,participateId, gameId,score1,score2) {
	const deferred = Q.defer();
	const query  = {participate :participateId , game: gameId, pool: poolId};
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

function findByGameId(gameId){
	const query  = {game : gameId};
	return Bet.find(query).populate('game').exec();
}

module.exports = BetRepository;
