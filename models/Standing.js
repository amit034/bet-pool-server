'use strict';

module.exports = function (sequelize, DataTypes) {
    const { STRING, INTEGER } = DataTypes;
    const Model = sequelize.define('Standing', {
        id: {
            type: INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        eventId: {
            type: INTEGER(11),
            allowNull: false,
            field: 'event_id'
        },
        teamId: {
            type: INTEGER(11),
            allowNull: false,
            field: 'team_id'
        },
        group: {
            type: STRING(50),
            allowNull: true,
            field: 'group_name'
        },
        stage: {
            type: STRING(50),
            allowNull: true,
            field: 'stage'
        },
        position: {
            type: INTEGER(3),
            allowNull: false,
            field: 'position'
        },
        playedGames: {
            type: INTEGER(3),
            defaultValue: 0,
            field: 'played_games'
        },
        won: {
            type: INTEGER(3),
            defaultValue: 0,
            field: 'won'
        },
        draw: {
            type: INTEGER(3),
            defaultValue: 0,
            field: 'draw'
        },
        lost: {
            type: INTEGER(3),
            defaultValue: 0,
            field: 'lost'
        },
        points: {
            type: INTEGER(3),
            defaultValue: 0,
            field: 'points'
        },
        goalsFor: {
            type: INTEGER(3),
            defaultValue: 0,
            field: 'goals_for'
        },
        goalsAgainst: {
            type: INTEGER(3),
            defaultValue: 0,
            field: 'goals_against'
        },
        goalDifference: {
            type: INTEGER(4),
            defaultValue: 0,
            field: 'goal_difference'
        }
    }, {
        tableName: 'standings',
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
            foreignKey: 'teamId',
            as: 'team'
        });
    };

    return Model;
};