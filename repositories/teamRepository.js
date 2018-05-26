const _ = require('lodash');
var Team = require('../models/Team');
var logger = require('../utils/logger');
var Q = require('q');

function TeamRepository() {
	this.findById = findById;
    this.findByCode = findByCode;
	this.createTeam = createTeam;
    this.findBy3ptData = findBy3ptData;
}

function findById(id) {
    return Team.findOne({_id: id}).exec();
}


function findByCode(code,eventId) {
    var deferred = Q.defer();
    var query = {
        code: code,
        event : eventId
    };
    console.log("searching team:" +code)
    Team.findOne(query, function(err, team) {

        if (err) {
            console.log("searching team error " +err);
            deferred.reject(new Error(err));
        }
        else {
            console.log("searching team result " + team);
            deferred.resolve(team);
        }
    });
    return deferred.promise;
}

function createTeam(req) {
	var team = new Team(req);
    return team.save();
}

function findBy3ptData(identifier) {
    var query = _.reduce(identifier, (result, value, key) => {
        result[`3pt.${key}`] = value;
        return result;
    }, {});
    return Team.findOne(query).exec();
}

module.exports = TeamRepository;
