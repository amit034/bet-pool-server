'use strict';
const _ = require('lodash');
const moment = require('moment');
module.exports = function (sequelize, DataTypes) {
    const {INTEGER} = DataTypes;
    const Model = sequelize.define('Bet', {
        id: {type: INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, field: 'id'},
        userId: {type: INTEGER(11), allowNull: false, field: 'user_id'},
        poolId: {type: INTEGER(11), allowNull: false, field: 'pool_id'},
        challengeId: {type: INTEGER(11), allowNull: false, field: 'challenge_id'},
        score1 : {type: INTEGER(5), field: 'score_1'},
        score2 : {type: INTEGER(5), field: 'score_2' }
    },{
        tableName: 'bets',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });
    Model.associate = function (models) {
        Model.belongsTo(models.Challenge, {
            foreignKey: 'challengeId'
        });
        Model.belongsTo(models.Pool, {
            foreignKey: 'poolId'
        });
        Model.belongsTo(models.Account, {
            foreignKey: 'userId'
        });
    };
    Model.prototype.score = function (score1, score2){
        if(_.isNil(this.score1) || _.isNil(this.score2)) return 0;
        if (this.score1 == score1 && this.score2 == score2) return 3;
        if (this.score1 - this.score2 == score1 - score2) return 2;
        if ((this.score1 - this.score2) * (score1 - score2) > 0) return 1;
        return 0;
    }
    return Model;
}
