'use strict';
const _ = require('lodash');
const repository = require('../repositories/eventRepository');
const challengeRepository = require('../repositories/challengeRepository');
const TeamRepository = require('../repositories/teamRepository');
const apiFootballSdk = require('../lib/apiFootballSDK');
const logger = require('../utils/logger');


function handleCreateAndGetEventsRequest(req, res) {
    return Promise.all([
        repository.findAll(),
        apiFootballSdk.getCompetitions({plan: 'TIER_ONE'})

    ]).then(([currentEvents, competitions]) => {
        const notRegistered = _.reject(competitions, ({id}) => {
            return _.find(currentEvents, (event => _.get(event.toJSON(), '3pt.id') === id));
        });
        return Promise.all(_.map(notRegistered, ({name, id, emblemUrl, currentSeason: {startDate, endDate}}) => {
            return repository.createEvent({name, startDate, endDate, imageUrl: emblemUrl, '3pt': {id}})
        })).then(() => {
            return handleActiveEventsRequest(req, res);
        })
    })
}
function handleActiveEventsRequest(req, res) {
    return repository.findAll({isActive: true})
        .then(function (events) {
            return res.send(events);
        })
        .catch(function (err) {
            return res.status(500).send({
                error: err.message
            });
        })
}

function handleGetEventsRequest(req, res) {
    return repository.findAll()
        .then(function (events) {
            return res.send(events);
        })
        .catch(function (err) {
            return res.status(500).send({
                error: err.message
            });
        })
}

function handleCreateEventRequest(req, res) {
    const name = req.body.name || null;
    repository.createEvent({name})
        .then(
            function (event) {
                logger.log('info', 'Event ' + name + ' has been created.' +
                    'Request from address ' + req.connection.remoteAddress + '.');
                return res.status(201).send(event);
            }).catch(
        function (err) {
            logger.log('error', 'An error has occurred while processing a request to create an ' +
                'Event from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
            return res.status(400).send({
                error: err.message
            });
        }
    );
}

function handleAddTeamToEventRequest(req, res) {
    const eventId = req.params.eventId || null;
    const teamId = req.params.teamId || null;
    const teamRepository = new TeamRepository();

    if (eventId && teamId) {
        return Q.all([repository.findById(eventId), teamRepository.findById(teamId)])
            .then(function ([event, team]) {
                let message;
                if (!eventId) {
                    message = "No event found for id " + eventId;
                }
                if (!team) {
                    message = "No team found for id " + teamId;
                }
                if (message) {
                    logger.log('error', 'An error has occurred while processing a request to create ' +
                        'game ' + team1_code + 'and' + team2_code + ' from ' + req.connection.remoteAddress +
                        '. Stack trace: ' + err.stack);
                    return res.status(400).send({
                        error: err.message
                    });
                }
                event.teams.push(team);
                event.save();
                return res.send();
            }).catch(function (err) {
                logger.log('error', 'An error has occurred while processing a request to create a ' +
                    'game from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
                res.json(400, {
                    error: err.message
                });
            });
    } else {
        logger.log('info', 'Bad request from ' +
            req.connection.remoteAddress + '. Message: eventId and TeamId is required.');
        res.status(400).send({
            error: 'eventId and TeamId  is required.'
        });
    }
}

function handleCreateTeamRequest(req, res) {
    return repository.createTeam(req.body)
        .then(function (team) {
            logger.log('info', 'Team ' + name + ' has been created.' +
                'Request from address ' + req.connection.remoteAddress + '.');
            res.status(201).send(team);
        }).catch(function (err) {
        logger.log('error', 'An error has occurred while processing a request to create an ' +
            'Team from ' + req.connection.remoteAddress + '. Stack trace: ' + err.stack);
        res.status(400).send({
            error: err.message
        });
    });
}
function handleGetChallenges(req, res) {
    const eventId = req.params.eventId || null;
    return challengeRepository.findAllByQuery( {eventId})
    .then(function (challenges) {
        return res.send(challenges);
    })
    .catch(function (err) {
        return res.status(500).send({
            error: err.message
        });
    });
}
function handleGetTeamsRequest(req, res) {
    const eventId = req.params.eventId || null;
    return repository.findById(eventId)
    .then(function (event) {
        if (event) {
            return res.send(event.teams);

        }
        logger.log('info', 'Could not retrieve event ' + eventId + ', no ' +
            'such id exists. Request from address ' + req.connection.remoteAddress + '.');
        res.status(404).send({
            error: "No Event found matching id " + eventId
        });
    })
    .catch(function (err) {
        return res.status(500).send({
            error: err.message
        });
    });
}

module.exports = {
    handleActiveEventsRequest,
    handleGetEventsRequest,
    handleCreateAndGetEventsRequest,
    createEvent: handleCreateEventRequest,
    addTeam: handleAddTeamToEventRequest,
    createTeam: handleCreateTeamRequest,
    getTeams: handleGetTeamsRequest,
    getChallenges: handleGetChallenges
};

