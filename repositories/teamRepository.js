/**
 * Created with JetBrains WebStorm.
 * User: valerio
 * Date: 10/05/13
 * Time: 12.58
 * To change this template use File | Settings | File Templates.
 */

var Team = require('../models/Team');
var logger = require('../utils/logger');
var Q = require('q');

function TeamRepository() {
	this.findById = findById;
    this.findByCode = findByCode;
	this.createTeam = createTeam;
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
	var deferred = Q.defer();
	var team = new Team({
		event: eventId,
        name: name,
        code: code
	});
    team.save(function(err, team) {
		if (err) {
			deferred.reject(new Error(err));
		}
		else {
			deferred.resolve(team);
		}
	});
	return deferred.promise;
}

module.exports = TeamRepository;
