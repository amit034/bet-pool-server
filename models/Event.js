var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var eventSchema = new Schema({
    name : {type : String  ,required: true, unique: false},
    isActive : {type:Boolean, 'default' : true},
    games: {type: [mongoose.Schema.ObjectId], 'default': [], ref: 'Game'},
    teams: {type: [mongoose.Schema.ObjectId], 'default': [], ref: 'Team'},
    startDate: { type: Date },
    endDate: { type: Date },
    winner: { type : String},
    imageUrl: { type : String},
    lastUpdated: { type: Date },
    '3pt': {type: mongoose.Schema.Types.Mixed}
});

module.exports =  mongoose.model('Event', eventSchema);
