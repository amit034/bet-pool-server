const express = require('express');
const passport = require('passport');
const { Server } = require("socket.io");
const favicon = require('serve-favicon');

const cors = require('cors');
const path = require('path');
const jobs = require('./jobs');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const methodOverride = require('method-override');
const debug = require('debug')('dev:server');
const fs = require('fs');
const securityPolicy = require('./securityPolicy');
const http = require('http');
const https = require('https');
const privateKey  = fs.readFileSync('./sslcert/idareu.live/privkey.pem', 'utf8');
const certificate = fs.readFileSync('./sslcert/idareu.live/fullchain.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};
//const tester = require('./test/sdk');

//Handlers
const accountHandler = require('./handlers/AccountHandler');
const eventHandler = require('./handlers/EventHandler');
const gameHandler = require('./handlers/GameHandler');
const poolHandler = require('./handlers/PoolHandler');
const betHandler = require('./handlers/BetHandler');
const FootBallApiHandler = require('./handlers/FootBallApiHandler');
const authenticationHandler = require('./handlers/AuthenticationHandler');
const publicPath = path.join(__dirname, 'client', 'src','frontend', 'public');
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

//app.use(morgan('combined', { stream: expressLogFile }));

app.use(express.static(publicPath));
app.use(favicon(publicPath + '/img/favicon.ico'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride());
app.use(passport.initialize());

const routes = require('./Routes');
if (process.env.NODE_ENV === 'development') {
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

const handlers = {
    account: accountHandler,
    event : eventHandler,
    game : gameHandler,
    auth: authenticationHandler,
    pools: poolHandler,
    bets  : betHandler,
    footballApi: FootBallApiHandler
};


exports.start = () => {
    routes.setup(app, handlers, securityPolicy.authorise);
    const httpServer = http.createServer(app);
    const httpsServer = https.createServer(credentials, app);

    httpServer.listen(8080);
    httpsServer.listen(8443);
    httpServer.on('error', onError);
    httpServer.on('listening', onListening);
    function onListening() {
        debug(`server listening on port ${port} in ${app.settings.env} mode`);
        // tester.runTests().then((response) => {
        //     console.log(response)
        // });
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
    const io = new Server(httpsServer);
    io.on('connection', function(socket) {

        socket.on('joinPool', (poolId) => {
            socket.join(poolId);
        });

        socket.on('leavePool', (poolId) => {
            socket.leave(poolId);
        });

    });
    jobs.start(io);

};

exports.app = app;
