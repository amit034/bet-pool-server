'use strict';
const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
	const {STRING, BOOLEAN, DATE, INTEGER, VIRTUAL, NOW} = DataTypes;
	const SecurityToken = sequelize.define('SecurityToken', {
		id: {type: INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, field: 'id'},
		apiAccessToken: {type: STRING, allowNull: false, field: 'api_access_token'},
		issueDate: {type: DATE, allowNull: false, field: 'issue_date'},
		expirationDate: {type: DATE, allowNull: false, field: 'expiration_date'},
		userId: {type: INTEGER, allowNull: false, field: 'user_id'},
		providerAccessToken: {type: STRING, allowNull: true, field: 'provider_access_token'}
	},{
		tableName: 'tokens',
		timestamps: false,
		engine: 'InnoDB',
		charset: 'utf8'
	});
	SecurityToken.associate = function (models) {
		models.SecurityToken.belongsTo(models.Account, {
			foreignKey: 'userId',
			targetKey: 'userId'
		});
	};
	SecurityToken.prototype.isExpired = function() {
		return Date.now() > this.expirationDate;
	};

	SecurityToken.createFromApiAndProviderToken = function(apiToken = {}, providerToken) {
		const {accessToken: apiAccessToken} = apiToken;
		if (!apiAccessToken || apiAccessToken < 32 || !providerToken || providerToken.length === 0) {
			throw new Error('The Api access token and the Facebook user access token are required');
		}
		return SecurityToken.create(_.assign(apiToken, {apiAccessToken,  providerAccessToken:  _.toString(providerToken)}));
	};

	SecurityToken.createFromApiToken = function(apiToken = {}) {
		const {accessToken: apiAccessToken} = apiToken;
		if (!apiAccessToken ||  apiAccessToken < 32 ) {
			throw new Error('The Api access token and the Facebook user access token are required');
		}
		return SecurityToken.create(_.assign(apiToken, {apiAccessToken}));
	};

	SecurityToken.findSecurityToken = function(apiAccessToken) {
		return SecurityToken.findOne({where: {apiAccessToken: apiAccessToken}});
	};

	SecurityToken.findSecurityTokenFromUserId = function(userId) {
		return SecurityToken.findOne({where: {userId}});
	};
	SecurityToken.removeSecurityToken = function(apiAccessToken) {
		return SecurityToken.destroy({where: { apiAccessToken: apiAccessToken }});
	};

	SecurityToken.removeSecurityTokensForUserId = function(userId) {
		return SecurityToken.destroy({where: { userId: userId }})
	};

	SecurityToken.authorise = function(apiAccessToken) {
		return SecurityToken.findSecurityToken({where: {apiAccessToken, isExpired: false}});
	};
	return SecurityToken;
};
