'use strict';

module.exports = function (sequelize, DataTypes) {
    const Game = sequelize.define('Game', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'gameId'
        },
        eventId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        gameId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        score1: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        score2: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        team1Code:{
            type: DataTypes.STRING,
            allowNull: false,
            field: 'team1_code'
        },
        team2Code:{
            type: DataTypes.STRING,
            allowNull: false,
            field: 'team2_code'
        }
    }, {
        tableName: 'Scores',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });

    Game.associate = function (models) {
        models.Game.belongsTo(models.Team, { as:'team1', foreignKey: 'team1Code', targetKey: 'teamCode', scope: {eventId: '7'}});
        models.Game.belongsTo(models.Team, { as:'team2', foreignKey: 'team2Code', targetKey: 'teamCode', scope: {eventId: '7'}});
    };
    return Game;
};
