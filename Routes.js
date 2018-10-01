const debug = require('debug')('dev:routes');
const passport = require('passport');
require('./passport')();
function setup(app, handlers, authorisationPolicy) {
    app.post('/api/profiles', handlers.account.createAccount);
    app.get('/api/profiles/:userId', handlers.account.getAccount);
    app.delete('/api/profiles/:userId', handlers.account.deleteAccount);
    app.post('/api/admin/events',  handlers.event.createEvent);
    app.post('/api/admin/teams',  handlers.event.createTeam);
    app.get('/api/admin/events/:eventId/teams', handlers.event.getTeams);
    app.post('/api/admin/events/:eventId/teams/:teamId', handlers.event.addTeam);
    app.post('/api/admin/events/:eventId/games', handlers.game.createGame);
    app.get('/api/events',  handlers.event.handleGetEventsRequest);
    app.get('/api/events/:eventId/teams', handlers.event.getTeams);
    app.get('/api/games', authorisationPolicy, handlers.game.getActiveGames);
    app.get('/api/:userId/pools',  authorisationPolicy , handlers.pools.getPools);
    app.post('/api/:userId/pools', authorisationPolicy, handlers.pools.createPool);
    app.get('/api/:userId/pools/:poolId/bets', authorisationPolicy, handlers.pools.getUserBets);
    app.post('/api/:userId/pools/:poolId/bets', authorisationPolicy, handlers.bets.updateUserBets);
    app.post('/api/:userId/pools/:poolId/games', authorisationPolicy, handlers.pools.addGames);
    app.post('/api/:userId/pools/:poolId/events', authorisationPolicy, handlers.pools.addEvents);
    app.post('/api/:userId/pools/:poolId/join', authorisationPolicy, handlers.pools.joinToPool);
    app.post('/api/:userId/pools/:poolId/participates', authorisationPolicy, handlers.pools.addParticipates);
    app.get('/api/:userId/pools/:poolId/participates', authorisationPolicy, handlers.pools.getParticipates);
    app.get('/api/:userId/pools/:poolId/challenges', authorisationPolicy, handlers.pools.getUserBets);
    app.post('/api/:userId/pools/:poolId/challenges/:challengeId', authorisationPolicy, handlers.bets.createOrUpdate);
    app.get('/api/:userId/pools/:poolId/challenges/:challengeId', authorisationPolicy, handlers.bets.getOthersBets);



    //app.post('/api/profiles/:userId/lists', authorisationPolicy, handlers.list.createShoppingList);
    //app.post('/api/profiles/:userId/lists', authorisationPolicy, handlers.list.createShoppingList);
    //app.post('/api/profiles/:userId/lists/:templateId', authorisationPolicy, handlers.list.createShoppingList);
    //app.put('/api/profiles/:userId/lists/:shoppingListId', authorisationPolicy, handlers.list.updateShoppingList);
    //app.get('/api/profiles/:userId/lists/:shoppingListId', authorisationPolicy, handlers.list.getShoppingList);
    //app.get('/api/profiles/:userId/lists', authorisationPolicy, handlers.list.getShoppingLists);
    //app.delete('/api/profiles/:userId/lists/:shoppingListId', authorisationPolicy, handlers.list.deleteShoppingList);
    //app.post('/api/profiles/:userId/lists/:shoppingListId/item/', authorisationPolicy, handlers.list.addShoppingItem);
    //app.put('/api/profiles/:userId/lists/:shoppingListId/item/:itemId', authorisationPolicy, handlers.list.updateShoppingItem);
    //app.delete('/api/profiles/:userId/lists/:shoppingListId/item/:itemId', authorisationPolicy, handlers.list.deleteShoppingItem);
    //app.put('/api/profiles/:userId/lists/:shoppingListId/item/:itemId/crossout', authorisationPolicy, handlers.list.crossoutShoppingItem);
    //app.post('/api/auth/facebook/mobile', handlers.auth.facebookMobileLogin);
    app.post('/api/auth/login', (req, res, next) => {  req.authStrategy = 'local'; return next();}, authorisationPolicy , handlers.auth.postLogin);
    //app.post('/api/auth/facebook', handlers.auth.verifyFacebookToken);
    app.post('/api/auth/facebook', (req, res, next) => { req.authStrategy = 'facebook-token'; return next();}, authorisationPolicy, handlers.auth.postLogin);
    app.post('/api/auth/google',(req, res, next) => { req.authStrategy = 'google-token'; return next();}, authorisationPolicy, handlers.auth.postLogin);

    //app.post('/api/auth/register', handlers.auth.handleUserPasswordRegister, handlers.auth.postLogin);
    app.post('/api/auth/register', (req, res, next) => { req.register = true; req.authStrategy = 'local'; return next();}, authorisationPolicy , handlers.auth.postLogin);
    app.post('/api/auth/register/facebook', (req, res, next) => { req.register = true; req.authStrategy = 'facebook-token'; return next();}, authorisationPolicy, handlers.auth.postLogin);
    app.post('/api/auth/register/google', (req, res, next) => {   req.register = true; req.authStrategy = 'google-token';return next();}, authorisationPolicy, handlers.auth.postLogin);

    app.post('/api/auth/logout', authorisationPolicy, handlers.auth.logout);

    // 404
    app.use((req, res, next) => {
        debug(req.url);
        return res.status(404).send({ msg: 'oh no! your page not found' });
    });

    // Error handler
    app.use((err, req, res, next) => {
        console.log(err);
        debug(err);
        switch(err.code) {
            case 401:
                return res.status(err.code).send({ msg: err.msg});
            default:
                return res.status(500).send({ msg: 'oh no! we issue some problems' })
        }
    })
}

exports.setup = setup;
