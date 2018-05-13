/***
 * Author: Valerio Gheri
 * Date: 13/03/2013
 * Account model
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var teamSchema = new Schema({
    nationality: {type : String, required: true},
    name : {type : String, required: true},
    flag : {type : String},
    isClub : {type : Boolean, required: true , default: true}
});
teamSchema.index( { nationality: 1, name: 1 }, { unique: true } );

module.exports =  mongoose.model('Team', teamSchema);
