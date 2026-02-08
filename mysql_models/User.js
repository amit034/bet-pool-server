'use strict';

module.exports = function (sequelize, DataTypes) {
    const User = sequelize.define('User', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            field: 'userId'
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'Users',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });
    User.associate = function (models) {
        models.User.hasMany(models.EventUser, {
            foreignKey: 'userId'
        });
    };
    return User;
};
