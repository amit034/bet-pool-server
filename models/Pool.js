'use strict';
const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
    const {STRING, BOOLEAN, DATE, INTEGER} = DataTypes;
    const Model = sequelize.define('Pool', {
        poolId: {type: INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true,  field: 'id'},
        ownerId: {type: INTEGER(11), allowNull: false, field: 'owner_id'},
        name : {type: STRING, allowNull: false},
        lastCheckIn:{type: DATE, field: 'last_check_in'},
        image: {type: STRING},
        public: {type: BOOLEAN, defaultValue: true},
        buyIn: {type: INTEGER(5), defaultValue: 0, field: 'buy_in'},
        factorsStrategy: {type: INTEGER(5), defaultValue: 0, field: 'factors_strategy'}
    },{
        tableName: 'pools',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });
    Model.associate = function (models) {
        Model.belongsToMany(models.Event, {
            through: models.PoolEvent,
            foreignKey: 'poolId',
            otherKey: 'eventId',
            as: 'events'
        });
        Model.belongsToMany(models.Account, {
            through: models.PoolParticipant,
            foreignKey: 'poolId',
            otherKey: 'userId'
        });
        Model.hasMany(models.PoolParticipant, {
            foreignKey: 'poolId',
            as: 'participates'
        });
        Model.belongsToMany(models.Challenge, {
            through: models.PoolChallenge,
            foreignKey: 'poolId',
            otherKey: 'challengeId',
            as: 'challenges'
        });
    };
    return Model;
}

