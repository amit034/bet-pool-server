// *******************************************************
// expressjs template
//
// assumes: npm install express
// defaults to jade engine, install others as needed
//
// assumes these subfolders:
//   public/
//   public/javascripts/
//   public/stylesheets/
//   views/
//
var express = require('express');
var methodOverride = require('method-override')
var app = express();
var AccountHandler = require('./handlers/AccountHandler');
var EventHandler = require('./handlers/EventHandler');
var GameHandler = require('./handlers/GameHandler');
var TeamHandler = require('./handlers/TeamHandler');
var PoolHandler = require('./handlers/PoolHandler');
var BetHandler = require('./handlers/BetHandler');
var ShoppingListHandler = require('./handlers/ShoppingListHandler');
var AuthenticationHandler = require('./handlers/AuthenticationHandler');
var routes = require('./Routes');
var fs = require('fs');
var securityPolicy = require('./securityPolicy');

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
app.use(express.logger({stream: expressLogFile}));
app.use(express.urlencoded());
app.use(express.json());
  app.use(methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));


if (process.env.NODE_ENV === 'development') {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}
if (process.env.NODE_ENV === 'production') {
  app.use(express.errorHandler());
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
