/**
 * Created with JetBrains WebStorm.
 * User: valerio
 * Date: 10/05/13
 * Time: 12.58
 * To change this template use File | Settings | File Templates.
 */

var Event = require('../models/Event');
var logger = require('../utils/logger');
var Q = require('q');

function EventRepository() {
	this.findById = findById;
    this.findByName = findByName;
	this.createEvent = createEvent;
    this.findActiveEventsByIds = findActiveEventsByIds;
}

function findById(id) {
	var deferred = Q.defer();
	var query = {
		_id: id
	};
    Event.findOne(query, function(err, event) {
		if (err) {
			deferred.reject(new Error(err));
		}
		else {
			deferred.resolve(event);
		}
	});
	return deferred.promise;
}

function findActiveEventsByIds(ids) {
    var deferred = Q.defer();
    var query = {
        _id: {$in: ids},
        isActive : true
    };
    Event.find(query, function(err, events) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            deferred.resolve(events);
        }
    });
    return deferred.promise;
}


function findByName(name) {
    var deferred = Q.defer();
    var query = {
        name : name
    };
    Event.findOne(query, function(err, event) {

        if (err) {
            console.log("searching team error " +err);
            deferred.reject(new Error(err));
        }
        else {

            deferred.resolve(event);
        }
    });
    return deferred.promise;
}

function createEvent(name) {
	var deferred = Q.defer();
	var event = new Event({
        name: name
	});
    event.save(function(err, event) {
		if (err) {
			deferred.reject(new Error(err));
		}
		else {
			deferred.resolve(event);
		}
	});
	return deferred.promise;
}

module.exports = EventRepository;
