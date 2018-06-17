const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    event :{type: mongoose.Schema.ObjectId, ref: 'Event',required: true},
    matchday: { type: Number, default: 0},
    team1 : { type: mongoose.Schema.ObjectId, ref: 'Team' ,required: false},
    team2 : { type: mongoose.Schema.ObjectId, ref: 'Team' ,required: false},
    challenges: {type: [mongoose.Schema.ObjectId], ref: 'Challenge'},
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
gameSchema.virtual('closed')
.get(function () {
    return this.playAt && moment(this.playAt) < moment();
});
module.exports =  mongoose.model('Game', gameSchema);
