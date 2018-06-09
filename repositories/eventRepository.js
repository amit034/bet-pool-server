const _ = require('lodash');
const Event = require('../models/Event');
const logger = require('../utils/logger');
const Q = require('q');

function EventRepository() {
	this.findById = findById;
	this.createEvent = createEvent;
    this.findActiveEventsByIds = findActiveEventsByIds;
    this.findBy3ptData = findBy3ptData;
    this.findAll = findAll;
}

function findAll(query) {
    return Event.find(query).exec();
}
function findById(id) {
    return Event.findOne({_id: id}).populate({path: 'teams', model: 'Team'}).exec();
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
            console.log("searching event error " +err);
            deferred.reject(new Error(err));
        }
        else {

            deferred.resolve(event);
        }
    });
    return deferred.promise;
}

function createEvent(data) {
	var event = new Event(data);
    return event.save();
}

function findBy3ptData(identifier) {
    var query = _.reduce(identifier, (result, value, key) => {
        result[`3pt.${key}`] = value;
        return result;
    }, {});
    return Event.findOne(query).exec();
}

module.exports = EventRepository;
