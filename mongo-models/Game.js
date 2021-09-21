const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    event :{type: mongoose.Schema.ObjectId, ref: 'Event',required: true},
    round: { type: Number, default: 0},
    team1 : {
        code: {type : String},
        flag : {type : String},
        name : {type : String, required: true}
    },
    team2 : {
        code: {type : String},
        flag : {type : String},
        name : {type : String, required: true}
    },
    challenges: {type: [mongoose.Schema.ObjectId], ref: 'Challenge'},
    playAt: { type: Date ,required: true},
    result: {
        score1: {type: String},
        score2: {type: String}
    },
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
