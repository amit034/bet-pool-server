var winston = require('winston');

function log(level, message) {
	// let caller = ((new Error().stack).split("at ")[4]).trim();
	// const startFilePath = caller.indexOf("(");
	// const startFileName = caller.lastIndexOf("\\") + 1;
	// const endFileName = caller.indexOf(":", startFileName);
	// const fileName = caller.substring(startFileName, endFileName);
	// const funcName = caller.substring(0, startFilePath);
	// const prefix = `${funcName}(${fileName}):`;
	//winston.log(level, `${prefix} ${message}`);
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
