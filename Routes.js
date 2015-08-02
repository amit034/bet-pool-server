/**
 * Created with JetBrains WebStorm.
 * User: Valerio Gheri
 * Date: 17/03/13
 * Time: 18.11
 * To change this template use File | Settings | File Templates.
 */
function setup(app, handlers, authorisationPolicy) {
    app.post('/api/profiles', handlers.account.createAccount);
	//app.get('/api/profiles/:username', handlers.account.getAccount);
    app.get('/api/profiles/:userId', authorisationPolicy, handlers.account.getAccount);
	//app.put('/api/profiles/:username', handlers.account.updateAccount);
	//app.del('/api/profiles/:username', handlers.account.deleteAccount);
    app.delete('/api/profiles/:userId', authorisationPolicy, handlers.account.deleteAccount);
    app.post('/api/admin/events', handlers.event.createEvent);
    app.post('/api/admin/:eventId/teams', handlers.team.createTeam);
    app.post('/api/admin/:eventId/games', handlers.game.createGame);
    app.get('/api/games', authorisationPolicy, handlers.game.getActiveGames);
    app.post('/api/:userId/pools', authorisationPolicy, handlers.pools.createPool);

    app.post('/api/:userId/pools/:poolId/games', authorisationPolicy, handlers.pools.addGames);
    app.post('/api/:userId/pools/:poolId/events', authorisationPolicy, handlers.pools.addEvents);
    app.post('/api/:userId/pools/:poolId/participates', authorisationPolicy, handlers.pools.addParticipates);
    app.post('/api/:userId/pools/:poolId/games/:gameId', authorisationPolicy, handlers.bets.createOrUpdate);

    app.post('/api/profiles/:userId/lists', authorisationPolicy, handlers.list.createShoppingList);
	app.post('/api/profiles/:userId/lists', authorisationPolicy, handlers.list.createShoppingList);
	app.post('/api/profiles/:userId/lists/:templateId', authorisationPolicy, handlers.list.createShoppingList);
	app.put('/api/profiles/:userId/lists/:shoppingListId', authorisationPolicy, handlers.list.updateShoppingList);
	app.get('/api/profiles/:userId/lists/:shoppingListId', authorisationPolicy, handlers.list.getShoppingList);
	app.get('/api/profiles/:userId/lists', authorisationPolicy, handlers.list.getShoppingLists);
	app.delete('/api/profiles/:userId/lists/:shoppingListId', authorisationPolicy, handlers.list.deleteShoppingList);
	app.post('/api/profiles/:userId/lists/:shoppingListId/item/', authorisationPolicy, handlers.list.addShoppingItem);
	app.put('/api/profiles/:userId/lists/:shoppingListId/item/:itemId', authorisationPolicy, handlers.list.updateShoppingItem);
	app.delete('/api/profiles/:userId/lists/:shoppingListId/item/:itemId', authorisationPolicy, handlers.list.deleteShoppingItem);
	app.put('/api/profiles/:userId/lists/:shoppingListId/item/:itemId/crossout', authorisationPolicy, handlers.list.crossoutShoppingItem);
	//app.post('/api/auth/facebook/mobile', handlers.auth.facebookMobileLogin);
    app.post('/api/auth/login', handlers.auth.handleLoginRequest);
	app.post('/api/auth/logout', authorisationPolicy, handlers.auth.logout);
}

exports.setup = setup;