const _ = require('lodash');
const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const moment = require('moment');
const Q = require('q');

function ChallengeRepository() {
	this.findById = findById;
	this.createChallenge = createChallenge;
	this.updateChallenge = updateChallenge;
	this.findByQuery = findByQuery;
}

function findByQuery(query){
    return Challenge.find(query).populate('on').exec();
}
function findById(challengeId) {
	return Challenge.findOne({
        _id: challengeId
    }).populate('on').exec();
}

function createChallenge(data) {
	var challenge = new Challenge(data);
    return challenge.save();
}

function updateChallenge(challenge) {

    var query = {
        status: {$ne: 'FINISHED'},
        _id: mongoose.Types.ObjectId(challenge.id),
        score1: {$lte: challenge.score1},
        score2: {$lte: challenge.score2}
    };
    var options = {
        'new': false
    };
    return Challenge.findOneAndUpdate(query,
        {
            score1: challenge.score1,
            score2: challenge.score2,
            status: challenge.status
        },
        options
    ).exec();
}

module.exports = ChallengeRepository;
