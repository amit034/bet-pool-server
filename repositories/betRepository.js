const Q = require('q');
const mongoose = require('mongoose');
const Bet = require('../models/Bet');

function BetRepository() {
	this.createOrUpdate = createOrUpdate;
	this.findUserBetsByPoolId = findUserBetsByPoolId;
	this.findByChallengeId = findByChallengeId;
	this.findUsersBetsByPoolId = findUsersBetsByPoolId;
}


function findUserBetsByPoolId(userId , poolId) {
	const query  = {participate :userId , pool: poolId};
	return Bet.find(query).populate('challenge').populate('challenge.on').exec();
}
function findUsersBetsByPoolId(poolId) {
	const query  = {pool: poolId};
	return Bet.find(query).populate('participate').exec();
}

function createOrUpdate(bet) {
	const {participate, challenge, pool, score1, score2 } = bet;
	const query  = {participate, challenge, pool};
    return Bet.findOneAndUpdate(query, {score1 , score2},{upsert: true, new: true});
}

function findByChallengeId(challengeId){
	const query  = {challenge : challengeId};
	return Bet.find(query).populate('challenge').populate('challenge.on').exec();
}

module.exports = BetRepository;
