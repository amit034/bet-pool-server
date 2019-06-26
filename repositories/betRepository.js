const Q = require('q');
const mongoose = require('mongoose');
const Bet = require('../models/Bet');

function BetRepository() {
	this.createOrUpdate = createOrUpdate;
	this.findByChallengeId = findByChallengeId;
	this.findUsersBetsByPoolId = findUsersBetsByPoolId;
	this.findUserBetsByQuery = findUserBetsByQuery;
}


function findUserBetsByQuery(query) {
	return Bet.find(query).exec();
}
function findUsersBetsByPoolId(poolId) {
	const query  = {pool: poolId};
	return Bet.find(query).exec();
}

function createOrUpdate(bet) {
	const {participate, challenge, pool, score1, score2 } = bet;
	const query  = {participate, challenge, pool};
    return Bet.findOneAndUpdate(query, {score1 , score2},{upsert: true, new: true}).populate({
    	path: 'challenge',
    	populate: { path: 'game', model: 'Game'}}).exec();
}

function findByChallengeId(challengeId){
	const query  = {challenge : challengeId};
	return Bet.find(query).exec();
}
module.exports = BetRepository;
