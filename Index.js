const config = require('./Config-debug');
const winston = require('winston');
const server = require('./Server');
// const jobs = require('./jobs');
const debug = require('debug')('dev:starter');
const db = require("./models");
// We will log normal api operations into api.log
debug('starting logger...');
winston.add(winston.transports.File, {
    filename: config.logger.api
});
// We will log all uncaught exceptions into exceptions.log
winston.handleExceptions(new winston.transports.File({
    filename: config.logger.exception
}));
debug('logger started. Connecting to MongoDB...');
//mongoose.connect(config.db.mongodb);
debug('Successfully connected to MongoDB. Starting web server...');
server.start();
jobs.start();
debug('Successfully started web server. Waiting for incoming connections...');

