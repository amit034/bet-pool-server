var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var gameSchema = new Schema({
    event :{type: mongoose.Schema.ObjectId, ref: 'Event',required: true},
    team1 : { type: mongoose.Schema.ObjectId, ref: 'Team' ,required: true},
    team2 : { type: mongoose.Schema.ObjectId, ref: 'Team' ,required: true},
    playAt: { type: Date ,required: true},
    score1 : { type: Number},
    score2 : { type: Number},
    status: {type: String},
    factor: {type: Number, default: 1},
    '3pt': {type: mongoose.Schema.Types.Mixed}
});

gameSchema.index( { team1: 1, team2: 1 , playAt :1 }, { unique: true } );

gameSchema.methods.isOpen = function() {
    return (this.playAt !== new Date());
};
module.exports =  mongoose.model('Game', gameSchema);
