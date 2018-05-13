var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var betSchema = new Schema({
    pool :{type: mongoose.Schema.ObjectId, ref: 'Pool',required: true},
    participate :{type: mongoose.Schema.ObjectId, required: true},
    game : {type: mongoose.Schema.ObjectId, ref: 'Game',required: true},
    score1 : {type : Number},
    score2 : {type : Number}
});
betSchema.index( { participate: 1, game: 1 }, { unique: true } );

module.exports =  mongoose.model('Bet', betSchema);
