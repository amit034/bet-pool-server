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
	async createOrUpdate(data, {transaction}) {
		const {userId, challengeId, poolId, score1, score2 } = data;
		const searchQuery = {poolId, challengeId, userId};
		let bets = await findUserBetsByQuery(searchQuery, {transaction});
		if (_.isEmpty(bets)) {
			await Bet.create(_.assign(searchQuery, {score1, score2}), {transaction});
		}
		return Bet.findAll({where: searchQuery, transaction});
	},
	findByChallengeId(challengeId, {transaction}){
		return findUserBetsByQuery({challengeId}, {transaction});
	}
};
