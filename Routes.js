function setup(app, handlers, authorisationPolicy) {
    app.post('/api/profiles', handlers.account.createAccount);
    app.get('/api/profiles/:userId', handlers.account.getAccount);
    app.delete('/api/profiles/:userId', handlers.account.deleteAccount);
    app.get('/api/admin/events',  handlers.event.handleActiveEventsRequest);
    app.post('/api/admin/events',  handlers.event.createEvent);
    app.post('/api/admin/teams',  handlers.team.createTeam);
    app.post('/api/admin/events/:eventId/teams/:teamId', handlers.event.addTeam);
    app.post('/api/admin/events/:eventId/games', handlers.game.createGame);
    app.get('/api/games', authorisationPolicy, handlers.game.getActiveGames);
    app.get('/api/:userId/pools', authorisationPolicy, handlers.pools.getPools);
    app.post('/api/:userId/pools', authorisationPolicy, handlers.pools.createPool);
    app.get('/api/:userId/pools/:poolId/bets', authorisationPolicy, handlers.pools.getUserBets);
    app.post('/api/:userId/pools/:poolId/games', authorisationPolicy, handlers.pools.addGames);
    app.post('/api/:userId/pools/:poolId/events', authorisationPolicy, handlers.pools.addEvents);
    app.post('/api/:userId/pools/:poolId/participates', authorisationPolicy, handlers.pools.addParticipates);
    app.post('/api/:userId/pools/:poolId/games/:gameId', authorisationPolicy, handlers.bets.createOrUpdate);

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
    app.post('/api/auth/login', handlers.auth.handleLoginRequest);
	app.post('/api/auth/logout', authorisationPolicy, handlers.auth.logout);
}

exports.setup = setup;