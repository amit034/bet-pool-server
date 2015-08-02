/***
 * Author: Valerio Gheri
 * Date: 13/03/2013
 * Account model
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var participateSchema = new Schema({
    user: { type: mongoose.Schema.ObjectId , ref: 'Account' ,required: true },
    joined : { type : Boolean ,'default': false}
});
var poolSchema = new Schema({
    owner: {type: mongoose.Schema.ObjectId,required: true , ref: 'Account'},
    participates : {type: [participateSchema], 'default': []},
    games: {type: [mongoose.Schema.ObjectId], 'default': [], ref: 'Game'},
    events: {type: [mongoose.Schema.ObjectId], 'default': [], ref: 'Event'}
});

mongoose.set('debug', true);

module.exports =  mongoose.model('Pool', poolSchema);
