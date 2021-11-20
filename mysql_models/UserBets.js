'use strict';

module.exports = function (sequelize, DataTypes) {
    const UserBets = sequelize.define('UserBets', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'UserBetscol'
        },
        userId: {
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
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: '0',
            allowNull: false,
            field: 'is_public'
        }
    }, {
        tableName: 'UserBets',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });
    UserBets.associate = function (models) {
        models.UserBets.belongsTo(models.Game, { foreignKey: 'gameId'});
    };
    return UserBets;
};
