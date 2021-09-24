'use strict';
const _ = require('lodash');
module.exports = function (sequelize, DataTypes) {
    const {STRING, INTEGER} = DataTypes;
    const Model = sequelize.define('Team', {
        id: {type: INTEGER(11), allowNull: false, primaryKey: true, autoIncrement: true, field: 'id'},
        code: {type: STRING(3), allowNull: false, unique: true},
        name: {type: STRING(45), allowNull: false},
        shortName: {type: STRING(15), required: true, field: 'short_name'},
        flag: {type : STRING(255)},
        fapiId: {type: INTEGER(11), field: 'f_api_id'},
    },{
        tableName: 'new_teams',
        timestamps: false,
        engine: 'InnoDB',
        charset: 'utf8'
    });
    Model.associate = function (models) {

    };
    return Model;
}

