const EventRepository = require('../repositories/eventRepository');
const TeamRepository = require('../repositories/teamRepository');
const logger = require('../utils/logger');
const EventHandler = function() {
	this.handleActiveEventsRequest = handleActiveEventsRequest;
	this.createEvent = handleCreateEventRequest;
	this.addTeam = handleAddTeamToEventRequest
};
function handleActiveEventsRequest(req, res){
	const repository = new EventRepository();
    return repository.findAll({isActive: true})
    .then(function(events){
         return res.send(events);
    })
    .catch(function(err){
        return res.status(500).send({
            error: err.message
        });
    })
}
function handleCreateEventRequest(req, res) {
	const name = req.body.name || null;
	const repository = new EventRepository();
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

function handleAddTeamToEventRequest(req, res){
	 const eventId = req.params.eventId || null;
	 const teamId = req.params.teamId || null;
	 const teamRepository = new TeamRepository();
     const eventRepository = new EventRepository();

     if (eventId && teamId){
		 return Q.all([eventRepository.findById(eventId), teamRepository.findById(teamId)])
		.then(function([event, team]) {
			let message;
	        if (!eventId) {
				message = "No event found for id " + eventId;
			}
			if(!team){
				message = "No team found for id " + teamId;
			}
			if (message){
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
	 }else {
		 logger.log('info', 'Bad request from ' +
			 req.connection.remoteAddress + '. Message: eventId and TeamId is required.');
		 res.status(400).send({
			 error: 'eventId and TeamId  is required.'
		 });
	 }
}

module.exports = EventHandler;

