var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var participateSchema = new Schema({
    user: { type: mongoose.Schema.ObjectId , ref: 'Account' ,required: true },
    joined : { type : Boolean ,'default': false}
});
var poolSchema = new Schema({
    owner: {type: mongoose.Schema.ObjectId,required: true , ref: 'Account'},
    participates : {type: [participateSchema], 'default': []},
    challenges: {type: [mongoose.Schema.ObjectId], 'default': [], ref: 'Challenge'},
    events: {type: [mongoose.Schema.ObjectId], 'default': [], ref: 'Event'},
    name : {type : String  ,required: true},
    factors: {
        0: {type : Number, required: true, default: 0},
        1: {type : Number  ,required: true, default: 10},
        2: {type : Number  ,required: true, default: 20},
        3: {type : Number  ,required: true, default: 30},
    }
});

mongoose.set('debug', true);

module.exports =  mongoose.model('Pool', poolSchema);
