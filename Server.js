const express = require('express');
const passport = require('passport');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const methodOverride = require('method-override');
const morgan = require('morgan');
const debug = require('debug')('dev:server');
const fs = require('fs');
const securityPolicy = require('./securityPolicy');

// Handlers
const AccountHandler = require('./handlers/AccountHandler');
const EventHandler = require('./handlers/EventHandler');
const GameHandler = require('./handlers/GameHandler');
const TeamHandler = require('./handlers/TeamHandler');
const PoolHandler = require('./handlers/PoolHandler');
const BetHandler = require('./handlers/BetHandler');
const ShoppingListHandler = require('./handlers/ShoppingListHandler');
const AuthenticationHandler = require('./handlers/AuthenticationHandler');

const app = express();
const port = process.env.PORT || 3000;

const expressLogFile = fs.createWriteStream('./logs/express.log', { flags: 'a' }); 
//var viewEngine = 'jade'; // modify for your view engine
// Configuration

//app.set('views', __dirname + '/views');
//app.set('view engine', viewEngine);
app.use(cors());
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//     res.header('Access-Control-Allow-Credentials', 'true');
//     return 'OPTIONS' == req.method ? res.sendStatus(200) : next();
// });

app.use(morgan('combined', { stream: expressLogFile }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride());
app.use(passport.initialize());
app.use(express.static(__dirname + '/public'));
const routes = require('./Routes');
if (process.env.NODE_ENV === 'development') {
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

const handlers = {
    account: new AccountHandler(),
    event : new EventHandler(),
    game : new GameHandler(),
    team : new TeamHandler(),
    list: new ShoppingListHandler(),
    auth: new AuthenticationHandler(),
    pools: new PoolHandler(),
    bets  : new BetHandler()
};


exports.start = () => {
    routes.setup(app, handlers, securityPolicy.authorise);
    const server = app.listen(port);
    
    server.on('error', onError);
    server.on('listening', onListening);
    
    function onListening() {
        debug(`server listening on port ${port} in ${app.settings.env} mode`);
    }

    function onError(error) {
        console.error(error);
        debug(error);
        if (error.syscall !== 'listen') { throw error; }
        switch (error.code) {
            case 'EACCES':
                process.exitCode = 1;
                break;
            case 'EADDRINUSE':
                process.exitCode = 1;
                break;
            default:
                throw error;
        }
    }
};

exports.app = app;
