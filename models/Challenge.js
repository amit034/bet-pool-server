const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TYPES = {
    FULL_TIME: "FULL_TIME"
};
const Challenge = new Schema({
    name: {type: String},
    type:  {type: String, default: TYPES.FULL_TIME ,required: true},
    event :{type: mongoose.Schema.ObjectId, ref: 'Event',required: true},
    status: {type: String},
    playAt: { type: Date ,required: true},
    refId: {type: mongoose.Schema.ObjectId, required: true},
    refName: {type: String, required: true},
    factor: {type: Number, default: 1},
    result: {
        score1: {type: String},
        score2: {type: String}
    }
}, {toObject: { virtuals: true }});
Challenge.virtual('on', {
  ref: doc => doc.refName, // The model to use, conditional on the doc
  localField: 'refId', // Find people or organizations where `localField`
  foreignField: '_id', // is equal to `foreignField`
  justOne: true // and return only one
});
Challenge.statics.TYPES = TYPES;
Challenge.index( { type: 1, refId: 1 , refName :1 }, { unique: true } );
module.exports =  mongoose.model('Challenge', Challenge);