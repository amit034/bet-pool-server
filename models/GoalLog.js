'use strict';
/* Table: goal_logs (game_id, score_1, score_2, created_at) — create in MySQL before inserts run. */

module.exports = function (sequelize, DataTypes) {
    const {INTEGER, DATE, NOW} = DataTypes;
    const Model = sequelize.define('GoalLog', {
        id: {type: INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, field: 'id'},
        gameId: {type: INTEGER(11), allowNull: false, field: 'game_id'},
        score1: {type: INTEGER(3), allowNull: false, field: 'score_1', defaultValue: 0},
        score2: {type: INTEGER(3), allowNull: false, field: 'score_2', defaultValue: 0},
        createdAt: {type: DATE, allowNull: false, field: 'created_at', defaultValue: NOW}
    }, {
        tableName: 'goal_logs',
        timestamps: true,
        updatedAt: false,
        createdAt: 'created_at',
        engine: 'InnoDB',
        charset: 'utf8'
    });
    Model.associate = function (models) {
        Model.belongsTo(models.Game, {
            foreignKey: 'gameId',
            as: 'game'
        });
    };
    return Model;
};
