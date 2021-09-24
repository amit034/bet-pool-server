'use strict';
const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
    const {STRING, BOOLEAN, DATE, INTEGER, NOW} = DataTypes;
    const Model = sequelize.define('Event', {
        id: {type: INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, field: 'id'},
        name: {type: STRING, allowNull: false, unique: true},
        image: {type: STRING},
        fapiId: {type: INTEGER(11), field: 'f_api_id'},
        isActive: {type: BOOLEAN, defaultValue: true, field: 'is_active'},
        updatedAt: {type: DATE, defaultValue: NOW, field: 'updated_at'}
    },{
        tableName: 'new_events',
        timestamps: true,
        createdAt: false,
        updatedAt: 'updated_at',
        engine: 'InnoDB',
        charset: 'utf8'
    });
    Model.associate = function (models) {
        Model.hasMany(models.PoolEvent, {
            foreignKey: 'eventId',
        });
        Model.belongsToMany(models.Pool, {
            through: models.PoolEvent,
            foreignKey: 'eventId',
            otherKey: 'poolId',
            as: 'pools'
        });
        Model.hasMany(models.Game, {
            foreignKey: 'eventId'
        });
    };
    return Model;
}

