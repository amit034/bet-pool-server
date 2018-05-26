var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var eventSchema = new Schema({
    name : {type : String  ,required: true, unique: true},
    isActive : {type:Boolean, 'default' : true},
    games: {type: [mongoose.Schema.ObjectId], 'default': [], ref: 'Game'},
    teams: {type: [mongoose.Schema.ObjectId], 'default': [], ref: 'Team'},
    '3pt': {type: mongoose.Schema.Types.Mixed}
});

module.exports =  mongoose.model('Event', eventSchema);
