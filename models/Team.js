/***
 * Author: Valerio Gheri
 * Date: 13/03/2013
 * Account model
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var teamSchema = new Schema({
    event :{type: mongoose.Schema.ObjectId, ref: 'Event',required: true},
    name : {type : String},
    code : {type : String}
});
teamSchema.index( { event: 1, code: 1 }, { unique: true } );

module.exports =  mongoose.model('Team', teamSchema);
