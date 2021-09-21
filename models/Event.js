'use strict';
const _ = require('lodash');

module.exports = function (sequelize, DataTypes) {
    const {STRING, BOOLEAN, DATE, INTEGER, NOW} = DataTypes;
    const Model = sequelize.define('Event', {
        id: {type: INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, field: 'id'},
        name: {type: STRING, allowNull: false, unique: true},
        isActive: {type: BOOLEAN, defaultValue: true, field: 'is_active'},
        updatedAt: {type: DATE, defaultValue: NOW, field: 'updated_at'}
    },{
        tableName: 'new_events',
        timestamps: true,
        createdAt: false,
        updatedAt: true,
        engine: 'InnoDB',
        charset: 'utf8'
    });
    Model.associate = function (models) {

    };
    return Model;
}

