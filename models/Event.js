/***
 * Author: Valerio Gheri
 * Date: 13/03/2013
 * Account model
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var eventSchema = new Schema({
    name : {type : String  ,required: true, unique: true},
    isActive : {type:Boolean, 'default' : true},
    games: {type: [mongoose.Schema.ObjectId], 'default': [], ref: 'Game'},
    teams: {type: [mongoose.Schema.ObjectId], 'default': [], ref: 'Team'}
});

module.exports =  mongoose.model('Event', eventSchema);
