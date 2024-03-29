var mongoose = require('mongoose');
const _ = require('lodash');
var Schema = mongoose.Schema;

var betSchema = new Schema({
    pool :{type: mongoose.Schema.ObjectId, ref: 'Pool',required: true},
    participate :{type: mongoose.Schema.ObjectId, ref: 'Account', required: true},
    challenge : {type: mongoose.Schema.ObjectId, ref: 'Challenge',required: true},
    score1 : {type : Number},
    score2 : {type : Number},
    public: {typw: String}
});
betSchema.index( { pool: 1, participate: 1, challenge: 1 }, { unique: true } );
betSchema.methods.score = function(score1, score2) {
    if(_.isNil(this.score1) || _.isNil(this.score2)) return 0;
	if (this.score1 == score1 && this.score2 == score2) return 3;
    if (this.score1 - this.score2 == score1 - score2) return 2;
    if ((this.score1 - this.score2) * (score1 - score2) > 0) return 1;
    return 0;
};
module.exports =  mongoose.model('Bet', betSchema);
