'use strict';
module.exports = function (sequelize, DataTypes) {
    const {BOOLEAN, INTEGER} = DataTypes;
    const Model = sequelize.define('PoolParticipant', {
        //id: {type: INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, field: 'id'},
        poolId: {type: INTEGER(11), allowNull: false, field: 'pool_id'},
        userId: {type: INTEGER(11), allowNull: false, field: 'user_id'},
        joined: {type: BOOLEAN, default: false},
        isPublic: {type: BOOLEAN, defaultValue: 0, field: 'is_public'}
    },{
        tableName: 'pool_participants',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });
    Model.associate = function (models) {
        Model.belongsTo(models.Account, {
            foreignKey: 'userId',
            targetKey: 'userId',
            as: 'user'
        })
    };
    return Model;
}