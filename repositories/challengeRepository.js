const _ = require('lodash');
const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const moment = require('moment');
const Q = require('q');

function ChallengeRepository() {
	this.findById = findById;
	this.createChallenge = createChallenge;
	this.updateChallengeById = updateChallengeById;
	this.updateChallengeByQuery = updateChallengeByQuery;
	this.findByQuery = findByQuery;
}

function findByQuery(query){
    return Challenge.find(query).exec();
}
function findById(challengeId) {
	return Challenge.findOne({
        _id: challengeId
    }).populate('game').exec();
}

function createChallenge(data) {
	var challenge = new Challenge(data);
    return challenge.save();
}

function updateChallengeById(id, challenge) {
    var query = {
        _id: mongoose.Types.ObjectId(id),
    };
    return updateChallengeByQuery(query, challenge)
}

function updateChallengeByQuery(query, challenge) {

    var options = {
        'new': false
    };
    const searchQuery = _.assign({status: {$ne: 'FINISHED'}, result: {$ne: null}}, query);
    return Challenge.findOneAndUpdate(searchQuery,
        {
            result: challenge.result,
            status: challenge.status
        },
        options
    ).exec();
}
module.exports = ChallengeRepository;
