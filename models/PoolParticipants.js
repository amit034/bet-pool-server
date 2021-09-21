'use strict';
const _ = require('lodash');
const moment = require('moment');
module.exports = function (sequelize, DataTypes) {
    const {BOOLEAN, INTEGER} = DataTypes;
    const Model = sequelize.define('PoolParticipants', {
        id: {type: INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, field: 'id'},
        poolId: {type: INTEGER(11), allowNull: false, field: 'pool_id'},
        userId: {type: INTEGER(11), allowNull: false, field: 'user_id'},
        joined: {type: BOOLEAN, default: false}
    },{
        tableName: 'pool_participants',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });
    Model.associate = function (models) {
        Model.belongsTo(models.Account, {
            foreignKey: 'userId',
            targetKey: 'userId',
            as: 'user'
        })
    };
    return Model;
}