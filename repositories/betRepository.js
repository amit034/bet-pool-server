const _ = require('lodash');
const {Bet} = require('../models');

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

		await Bet.upsert(data, {transaction, updateOnDuplicate: ['score1', 'score2']});
		return Bet.findOne({where: searchQuery, transaction});
	},
	async createBulk(data, {transaction} = {} ) {
		return Bet.bulkCreate(data, {transaction, updateOnDuplicate: ['score1', 'score2']});
	},
	async bulkUpdate(data, {transaction} = {}) {
		return Promise.all(_.map(data, (bet) => {
			if (!bet.id) return Promise.resolve();
			const {score1, score2} = bet;
			return Bet.update({score1, score2}, {where: {id: bet.id}, transaction, updateOnDuplicate: ['score1', 'score2']});
		}));
	},
	findByChallengeId(challengeId, {transaction}){
		return findUserBetsByQuery({challengeId}, {transaction});
	}
};
