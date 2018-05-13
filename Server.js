
const express = require('express');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const methodOverride = require('method-override');
const morgan = require('morgan');

const app = express();
const AccountHandler = require('./handlers/AccountHandler');
const EventHandler = require('./handlers/EventHandler');
const GameHandler = require('./handlers/GameHandler');
const TeamHandler = require('./handlers/TeamHandler');
const PoolHandler = require('./handlers/PoolHandler');
const BetHandler = require('./handlers/BetHandler');
const ShoppingListHandler = require('./handlers/ShoppingListHandler');
const AuthenticationHandler = require('./handlers/AuthenticationHandler');

const routes = require('./Routes');
const fs = require('fs');
const securityPolicy = require('./securityPolicy');

var expressLogFile = fs.createWriteStream('./logs/express.log', {flags: 'a'}); 
//var viewEngine = 'jade'; // modify for your view engine
// Configuration

  //app.set('views', __dirname + '/views');
  //app.set('view engine', viewEngine);
var allowCrossDomain = function(req, res, next) {
    console.log(req.url);
	res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
	
      res.send(200);
    }
    else {
      next();
    }
};

app.use(allowCrossDomain);  
app.use(morgan('combined', {stream: expressLogFile}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(methodOverride());
app.use(express.static(__dirname + '/public'));


if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}
if (process.env.NODE_ENV === 'production') {
  app.use(errorHandler());
}


var handlers = {
  account: new AccountHandler(),
  event : new EventHandler(),
  game : new GameHandler(),
  team : new TeamHandler(),
  list: new ShoppingListHandler(),
  auth: new AuthenticationHandler(),
  pools: new PoolHandler(),
  bets  : new BetHandler()
};

function start() {
  routes.setup(app, handlers, securityPolicy.authorise);
  var port = process.env.PORT || 3000;
  app.listen(port);
  console.log("Express server listening on port %d in %s mode", port, app.settings.env);
}
// *******************************************************
exports.start = start;
exports.app = app;
