// Load environment variables from .env file
require('dotenv').config();

// Add global error handlers to prevent server crashes
process.on('uncaughtException', (error) => {
    console.error('\n' + '='.repeat(70));
    console.error('❌ UNCAUGHT EXCEPTION in Server.js:');
    console.error('='.repeat(70));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('='.repeat(70) + '\n');
    
    // Write to log file
    const fs = require('fs');
    try {
        fs.appendFileSync('./logs/exceptions.log', 
            `${new Date().toISOString()} - UNCAUGHT EXCEPTION\n${error.stack}\n\n`,
            'utf8'
        );
    } catch (e) {
        console.error('Failed to write to exceptions.log');
    }
    // DON'T EXIT - Keep server alive
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n' + '='.repeat(70));
    console.error('❌ UNHANDLED PROMISE REJECTION in Server.js:');
    console.error('='.repeat(70));
    console.error('Reason:', reason);
    console.error('Promise:', promise);
    if (reason && reason.stack) {
        console.error('Stack:', reason.stack);
    }
    console.error('='.repeat(70) + '\n');
    
    // Write to log file
    const fs = require('fs');
    try {
        const stack = reason && reason.stack ? reason.stack : String(reason);
        fs.appendFileSync('./logs/exceptions.log', 
            `${new Date().toISOString()} - UNHANDLED REJECTION\n${stack}\n\n`,
            'utf8'
        );
    } catch (e) {
        console.error('Failed to write to exceptions.log');
    }
    // DON'T EXIT - Keep server alive
});

// Graceful shutdown handlers
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT (Ctrl+C), shutting down gracefully...');
    await exports.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await exports.stop();
    process.exit(0);
});

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


// Track if server has already started
let serverStarted = false;
let httpServer = null;
let httpsServer = null;

exports.start = () => {
    // Prevent starting the server twice
    if (serverStarted) {
        console.warn('⚠️  Server.start() called but server is already running. Ignoring...');
        return;
    }
    
    serverStarted = true;
    
    routes.setup(app, handlers, securityPolicy.authorise);
    
    httpServer = http.createServer(app);
    httpsServer = https.createServer(credentials, app);

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
        console.error('\n❌ Server Error:', error.message);
        debug(error);
        if (error.syscall !== 'listen') { throw error; }
        switch (error.code) {
            case 'EACCES':
                console.error('❌ EACCES: Permission denied. Try running with sudo or use a port > 1024');
                throw error;
            case 'EADDRINUSE':
                console.error('❌ EADDRINUSE: Port already in use!');
                console.error('   Run: pkill -f "node Index.js" or lsof -ti:8080,8443 | xargs kill -9');
                throw error;
            default:
                throw error;
        }
    }
    const io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:8080", "http://localhost:8081"],
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    io.on('connection', function(socket) {

        socket.on('joinPool', (poolId) => {
            socket.join(poolId);
        });

        socket.on('leavePool', (poolId) => {
            socket.leave(poolId);
        });

    });
    
    // Store io instance globally for testing
    global.io = io;
    
    // Start jobs (including Unified Engagement System)
    // Note: The Engagement System is started within jobs/index.js to avoid duplicate initialization
    try {
        jobs.start(io).catch(error => {
            console.error('❌ Error starting jobs:', error);
            console.error('   Jobs system will retry or continue without this job');
        });
    } catch (error) {
        console.error('❌ Failed to start jobs system:', error);
    }

};

exports.stop = async () => {
    if (!serverStarted) {
        console.log('ℹ️  Server is not running');
        return;
    }
    
    console.log('🛑 Stopping server...');
    
    // Stop engagement system (and Telegram bot polling)
    try {
        const EngagementSystem = require('./engagement-system');
        await EngagementSystem.stop();
        console.log('✅ Engagement system stopped');
    } catch (error) {
        console.error('❌ Error stopping engagement system:', error);
    }
    
    if (httpServer) {
        httpServer.close(() => {
            console.log('✅ HTTP server closed');
        });
    }
    
    if (httpsServer) {
        httpsServer.close(() => {
            console.log('✅ HTTPS server closed');
        });
    }
    
    serverStarted = false;
};

exports.app = app;
