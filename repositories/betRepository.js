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

function createOrUpdate(bet) {
	const {participate, game, pool, score1, score2 } = bet;
	const query  = {participate, game, pool};
    return Bet.findOneAndUpdate(query, {score1 , score2},{'upsert':true});
}

function findByGameId(gameId){
	const query  = {game : gameId};
	return Bet.find(query).populate('game').sort({ playAt: -1 }).exec();
}

module.exports = BetRepository;
