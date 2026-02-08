'use strict';
const _ = require('lodash');
const moment = require('moment');

const TYPES = {
    FULL_TIME: "FULL_TIME"
};
module.exports = function (sequelize, DataTypes) {
    const {STRING, VIRTUAL, DATE, INTEGER} = DataTypes;
    const Model = sequelize.define('Challenge', {
        id: {type: INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, field: 'id'},
        name: {type: STRING, allowNull: true},
        type: {type: STRING(15), defaultValue: TYPES.FULL_TIME ,allowNull: false},
        refName: {type: STRING(15), allowNull: false, field: 'ref_name'},
        refId : {type: INTEGER(11), allowNull: false, field: 'ref_id'},
        playAt: {type: DATE,  allowNull: false, field: 'play_at'},
        status: {type: STRING(9), defaultValue: 'SCHEDULED'},
        score1: {type: INTEGER(3), field: 'score_1'},
        score2: {type: INTEGER(9), field: 'score_2'},
        odds1: {type: INTEGER(3), field: 'odds_1'},
        oddsX: {type: INTEGER(9), field: 'odds_x'},
        odds2: {type: INTEGER(3), field: 'odds_2'},
        factorId: {type: INTEGER(1), defaultValue: 1, field: 'factor_id'},
        isOpen: {
            type: VIRTUAL,
            get() {
                return moment().isBefore(this.playAt);
            }
        }
    },{
        tableName: 'challenges',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });
    Model.associate = function (models) {
        Model.belongsTo(models.Game, {
            foreignKey: 'refId',
            as: 'game'
        });
        Model.belongsToMany(models.Pool, {
            through: models.PoolChallenge,
            foreignKey: 'challengeId',
            otherKey: 'poolId',
            as: 'pools'
        });
        Model.addScope('game', {
            where: { refName: 'Game' },
            include: [
                { model: models.Game, as: 'game', include: [{model: models.Team, as: 'homeTeam'}, {model: models.Team, as: 'awayTeam'}]}
            ]
        });
    }

    Model.TYPES = TYPES;
    return Model;
}