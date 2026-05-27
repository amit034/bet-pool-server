'use strict';

module.exports = function (sequelize, DataTypes) {
    const {INTEGER, STRING, DATE} = DataTypes;
    const Model = sequelize.define('PoolInvite', {
        id: {type: INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, field: 'id'},
        poolId: {type: INTEGER(11), allowNull: false, field: 'pool_id'},
        email: {type: STRING(255), allowNull: false, field: 'email'},
        token: {type: STRING(64), allowNull: false, unique: true, field: 'token'},
        expiresAt: {type: DATE, allowNull: true, field: 'expires_at'},
        consumedAt: {type: DATE, allowNull: true, field: 'consumed_at'},
        createdBy: {type: INTEGER(11), allowNull: false, field: 'created_by'},
        createdAt: {type: DATE, allowNull: false, field: 'created_at', defaultValue: DataTypes.NOW}
    }, {
        tableName: 'pool_invites',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });
    return Model;
};
