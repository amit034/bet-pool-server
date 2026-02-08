'use strict';
const moment = require('moment');
const crypto = require('crypto');
const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
    const {STRING, INTEGER} = DataTypes;
    const TokenProvider = sequelize.define('TokenProvider', {
        id: {type: INTEGER(9), allowNull: false, primaryKey: true, autoIncrement: true, field: 'id'},
        provider: {type: STRING, allowNull: false},
        providerId: {type: STRING, allowNull: false},
        token: {type: INTEGER(16), allowNull: true},
    }, {
        tableName: 'tokens',
        timestamps: true,
        engine: 'InnoDB',
        charset: 'utf8',
    });
    TokenProvider.associate = function (models) {
        models.TokenProvider.hasOne(models.Account, {
            foreignKey: 'facebookProviderId',
            targetKey: 'providerId',
            scope: {
                provider: 'Facebook'
            },
            as: 'facebookProvider'
        });
        models.TokenProvider.hasOne(models.Account, {
            foreignKey: 'googleProviderId',
            targetKey: 'providerId',
            scope: {
                provider: 'Google'
            },
            as: 'googleProvider'
        });
    };
    return TokenProvider;
}