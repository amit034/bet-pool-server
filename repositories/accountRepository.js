'use strict';
const {Account} = require('../models');

module.exports = {
	findById(userId) {
		return Account.findByPk(userId);
	},
	findActiveAccountsByIds(userId) {
		return Account.findAll({where: {userId}});
	},
	createAccount(details, {transaction}) {
		return Account.create(details, {transaction});
	},
	findAccountByQuery(where, {transaction}) {
		return Account.findOne({where, transaction});
	},
	findAccountByUsernamePassword(username, password) {
		return Account.findOne({where: {username, password}});
	},
	async updateAccount({userId, firstName, lastName, email}) {
		const user = await Account.findByPk(userId);
		if (user) {
			return user.update({firstName, lastName, email});
		}
		return Promise.resolve();
	},
	async updateLastLoginDate(userId, lastLogin) {
		const user = await Account.findByPk(userId);
		if (user) {
			return user.update({lastLogin});
		}
		return Promise.resolve();
	},
	async disableAccount(userId) {
		const user = await Account.findByPk(userId);
		if (user) {
			return user.update({isActive: false, canLogin: false});
		}
		return Promise.resolve();
	}
};
