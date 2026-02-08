/***
 * Author: Valerio Gheri
 * Date: 13/03/2013
 * Account model
 */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const teamSchema = new Schema({
    code: {type : String},
    name : {type : String, required: true},
    shortName: {type : String, required: true},
    flag : {type : String},
    players: {type: [String]},
    '3pt': {type: mongoose.Schema.Types.Mixed}
});
teamSchema.index( { name: 1, code: 2 }, { unique: true } );

module.exports =  mongoose.model('Team', teamSchema);
