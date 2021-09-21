'use strict';
const _ = require('lodash');
module.exports = function (sequelize, DataTypes) {
    const {INTEGER} = DataTypes;
    const Model = sequelize.define('PoolEvents', {
        id: {type: INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, field: 'id'},
        poolId: {type: INTEGER(11), allowNull: false, field: 'pool_id'},
        eventId: {type: INTEGER(11), allowNull: false, field: 'event_id'}
    },{
        tableName: 'poolEvents',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });
    Model.associate = function (models) {

    };
    return Model;
}