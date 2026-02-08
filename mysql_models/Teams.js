'use strict';

module.exports = function (sequelize, DataTypes) {
    const Team = sequelize.define('Team', {
        eventId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'team_title'
        },
        teamCode: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'team_code',
            primaryKey: true
        }
    }, {
        tableName: 'teams',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });

    return Team;
};
