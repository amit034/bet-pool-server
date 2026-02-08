'use strict';
const _ = require('lodash');
const moment = require('moment');
module.exports = function (sequelize, DataTypes) {
    const {STRING, VIRTUAL, DATE, INTEGER} = DataTypes;
    const Model = sequelize.define('Game', {
        id: {type: INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, field: 'id'},
        eventId: {type: INTEGER(11), allowNull: false, field: 'event_id'},
        round: {type: INTEGER(2), default: 0},
        playAt: {type: DATE,  allowNull: false, field: 'play_at'},
        isOpen: {
            type: VIRTUAL,
            get() {
                return moment().isBefore(this.playAt);
            }
        },
        homeTeamId: {type: INTEGER(9), allowNull: false, field: 'home_team_id'},
        homeTeamScore: {type: INTEGER(3), field: 'home_team_score'},
        awayTeamId: {type: INTEGER(9), allowNull: false, field: 'away_team_id'},
        awayTeamScore: {type: INTEGER(3), field: 'away_team_score'},
        status: {type: STRING(9), defaultValue: 'SCHEDULED'},
        factorId: {type: INTEGER(1), defaultValue: 1, field: 'factor_id'},
        fapiId: {type: INTEGER(11), field: 'f_api_id'},
    },{
        tableName: 'games',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });
    Model.associate = function (models) {
        Model.belongsTo(models.Event, {
            foreignKey: 'eventId',
            as: 'event'
        });
        Model.belongsTo(models.Team, {
            foreignKey: 'homeTeamId',
            as: 'homeTeam'
        });
        Model.belongsTo(models.Team, {
            foreignKey: 'awayTeamId',
            as: 'awayTeam'
        });
    };
    return Model;
}



