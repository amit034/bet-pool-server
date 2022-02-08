'use strict';
const _ = require('lodash');
module.exports = function (sequelize, DataTypes) {
    const {INTEGER, STRING} = DataTypes;
    const Model = sequelize.define('PoolEvent', {
        id: {type: INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, field: 'id'},
        poolId: {type: INTEGER(11), allowNull: false, field: 'pool_id'},
        eventId: {type: INTEGER(11), allowNull: false, field: 'event_id'},
        filter: {type: STRING, allowNull: true, field: 'filter'}
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