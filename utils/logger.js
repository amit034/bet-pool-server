var winston = require('winston');

function log(level, message) {
	winston.log(level, message);
}
function error(message) {
	log('error', message);
}
function info(message) {
	log('info', message);
}
function debug(message) {
	log('debug', message);
}
module.exports = {
	log,
	info,
	debug,
	error
}
