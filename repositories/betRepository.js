/**
 * Created with JetBrains WebStorm.
 * User: valerio
 * Date: 10/05/13
 * Time: 12.58
 * To change this template use File | Settings | File Templates.
 */

var Bet = require('../models/Bet');
var logger = require('../utils/logger');
var Q = require('q');

function BetRepository() {
	this.createOrUpdate = createOrUpdate;
	this.findUserBetsByPoolId = findUserBetsByPoolId;
}


function findUserBetsByPoolId(userId , poolId) {
	var query  = {participate :userId , pool: poolId};
	return Bet.find(query).exec();
}
function createOrUpdate(poolId,participateId, gameId,score1,score2) {
	var deferred = Q.defer();
//	var bet = new Bet({
//		pool: poolId,
//        participate : participateId,
//        game: gameId,
//        score1 : score1,
//        score2 : score2
//	});
    var query  = {participate :participateId , game: gameId };
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
