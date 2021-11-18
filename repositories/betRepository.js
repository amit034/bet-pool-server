const _ = require('lodash');
const {Bet, Challenge, Game} = require('../models');

function findUserBetsByQuery(query, {transaction} = {}) {
	return Bet.findAll({where: query, transaction});
}
module.exports = {
	findUserBetsByQuery,
	findUsersBetsByPoolId(poolId, {transaction} = {}) {
		return findUserBetsByQuery({poolId}, {transaction});
	},
	async createOrUpdate(data, {transaction} = {}) {
		const {userId, challengeId, poolId} = data;
		const searchQuery = {poolId, challengeId, userId};

		await Bet.upsert(data, {transaction, updateOnDuplicate: ['score_1', 'score_2']});
		return Bet.findOne({where: searchQuery, transaction});
	},
	findByChallengeId(challengeId, {transaction}){
		return findUserBetsByQuery({challengeId}, {transaction});
	}
};
