'use strict';

module.exports = function (sequelize, DataTypes) {
    const EventUser = sequelize.define('EventUser', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        eventId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'eventUsers',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });

    return EventUser;
};
