const debug = require('debug')('dev:routes');
const path = require("path");
require('./passport')();
const demoPools = require('./mocks/pools');
const demoPool = require('./mocks/pool');
const publicPath = path.join(__dirname, 'client', 'src','frontend', 'public', 'index.html');

// Import Unified Engagement System
const EngagementSystem = require('./engagement-system');
const EngagementManager = require('./engagement-system/core/EngagementManager');
const { InsightRegistry } = require('./engagement-system/insights');
const { NotificationRegistry } = require('./engagement-system/notifications');
const PollRegistry = require('./engagement-system/core/PollRegistry');
function setup(app, handlers, authorisationPolicy) {
    app.get('/status', (req, res)=> res.send('ok'));
    app.post('/api/profiles', handlers.account.createAccount);
    app.get('/api/profiles/:userId', handlers.account.getAccount);
    app.delete('/api/profiles/:userId', handlers.account.deleteAccount);
    app.get('/api/admin/competitions',  handlers.footballApi.getCompetitions);
    app.get('/api/admin/competition/:competitionId/matches',  handlers.footballApi.getMatches);
    app.get('/api/admin/events', handlers.event.handleCreateAndGetEventsRequest);
    app.post('/api/admin/events',  handlers.event.createEvent);
    app.post('/api/admin/teams',  handlers.event.createTeam);
    app.get('/api/admin/events/:eventId/teams', handlers.event.getTeams);
    app.get('/api/admin/events/:eventId/challenges', handlers.event.getChallenges);
    app.post('/api/admin/events/:eventId/teams/:teamId', handlers.event.addTeam);
    app.post('/api/admin/events/:eventId/games', handlers.game.createGame);
    app.get('/api/events', handlers.event.handleActiveEventsRequest);
    app.get('/api/events/:eventId/teams', handlers.event.getTeams);
    app.get('/api/games', authorisationPolicy, handlers.game.getActiveGames);
    app.get('/api/:userId/pools',  authorisationPolicy, (req, res, next) => {
        if (req.isDemo) {
            return res.json(demoPools);
        }
        next();
    } , handlers.pools.getPools);
    app.post('/api/:userId/pools', authorisationPolicy, handlers.pools.createPool);
    app.get('/api/:userId/pools/:poolId/bets', authorisationPolicy, (req, res, next) => {
        if (req.isDemo) {
            return res.json(demoPool.userBets);
        }
        next();
    } , handlers.pools.getUserBets);
    app.post('/api/:userId/pools/:poolId/bets', authorisationPolicy, handlers.bets.updateUserBets);
    app.post('/api/:userId/pools/:poolId/games', authorisationPolicy, handlers.pools.addGames);
    app.post('/api/:userId/pools/:poolId/events', authorisationPolicy, handlers.pools.addEvents);
    app.post('/api/:userId/pools/:poolId/join', authorisationPolicy, handlers.pools.joinToPool);
    app.post('/api/:userId/pools/:poolId/participates', authorisationPolicy, handlers.pools.addParticipates);
    app.get('/api/:userId/pools/:poolId/participates', authorisationPolicy, handlers.pools.getParticipates);
    app.get('/api/:userId/pools/:poolId/challenges', authorisationPolicy, handlers.pools.getUserBets);
    app.post('/api/:userId/pools/:poolId/challenges/:challengeId', authorisationPolicy, handlers.bets.createOrUpdate);
    app.get('/api/:userId/pools/:poolId/challenges/:challengeId', authorisationPolicy, handlers.bets.getOthersBets);

    // Note: Telegram bot commands call BotHandler methods directly (no HTTP routes needed)
    // The BotHandler provides the same functionality with proper validation

    // app.post('/api/profiles/:userId/lists', authorisationPolicy, handlers.list.createShoppingList);
    // app.post('/api/profiles/:userId/lists', authorisationPolicy, handlers.list.createShoppingList);
    // app.post('/api/profiles/:userId/lists/:templateId', authorisationPolicy, handlers.list.createShoppingList);
    // app.put('/api/profiles/:userId/lists/:shoppingListId', authorisationPolicy, handlers.list.updateShoppingList);
    // app.get('/api/profiles/:userId/lists/:shoppingListId', authorisationPolicy, handlers.list.getShoppingList);
    // app.get('/api/profiles/:userId/lists', authorisationPolicy, handlers.list.getShoppingLists);
    // app.delete('/api/profiles/:userId/lists/:shoppingListId', authorisationPolicy, handlers.list.deleteShoppingList);
    // app.post('/api/profiles/:userId/lists/:shoppingListId/item/', authorisationPolicy, handlers.list.addShoppingItem);
    // app.put('/api/profiles/:userId/lists/:shoppingListId/item/:itemId', authorisationPolicy, handlers.list.updateShoppingItem);
    // app.delete('/api/profiles/:userId/lists/:shoppingListId/item/:itemId', authorisationPolicy, handlers.list.deleteShoppingItem);
    // app.put('/api/profiles/:userId/lists/:shoppingListId/item/:itemId/crossout', authorisationPolicy, handlers.list.crossoutShoppingItem);
    //app.post('/api/auth/facebook/mobile', handlers.auth.facebookMobileLogin);
    app.post('/api/auth/login', (req, res, next) => {  req.authStrategy = 'local'; return next();}, authorisationPolicy , handlers.auth.postLogin);
    //app.post('/api/auth/facebook', handlers.auth.verifyFacebookToken);
    app.post('/api/auth/facebook', (req, res, next) => { req.authStrategy = 'facebook-token'; return next();}, authorisationPolicy, handlers.auth.postLogin);
    app.post('/api/auth/google',(req, res, next) => {
        req.authStrategy = 'google-token'; return next();
        }, authorisationPolicy, handlers.auth.postLogin);

    //app.post('/api/auth/register', handlers.auth.handleUserPasswordRegister, handlers.auth.postLogin);
    app.post('/api/auth/register', (req, res, next) => {
        req.register = true; req.authStrategy = 'local'; return next();}, authorisationPolicy , handlers.auth.postLogin);
    app.post('/api/auth/register/facebook', (req, res, next) => { req.register = true; req.authStrategy = 'facebook-token'; return next();}, authorisationPolicy, handlers.auth.postLogin);
    app.post('/api/auth/register/google', (req, res, next) => {
        req.register = true; req.authStrategy = 'google-token';return next();
        }, authorisationPolicy, handlers.auth.postLogin);
    app.post('/api/auth/logout', authorisationPolicy, handlers.auth.logout);
    
    app.get('*', (req,res) =>{
        res.sendFile(publicPath);
    });
    // 404
    app.use((req, res, next) => {
        debug(req.url);
        return res.status(404).send({ msg: 'oh no! your page not found' });
    });

    // Unified Engagement System API Endpoints
    // ==========================================
    
    // System Status
    app.get('/api/engagement/status', (req, res) => {
        try {
            const status = EngagementSystem.getStatus();
            res.json({
                success: true,
                data: status,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Manual Trigger - Run engagement cycle
    app.post('/api/engagement/trigger', async (req, res) => {
        try {
            console.log('🚀 Manual engagement trigger requested');
            await EngagementManager.run();
            res.json({
                success: true,
                message: 'Engagement Manager triggered successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Trigger Specific Insight
    app.post('/api/engagement/trigger/insight/:insightId', async (req, res) => {
        try {
            const { insightId } = req.params;
            const insight = InsightRegistry.getInsight(insightId);
            
            if (!insight) {
                return res.status(404).json({
                    success: false,
                    error: `Insight ${insightId} not found`,
                    timestamp: new Date().toISOString()
                });
            }

            console.log(`🎯 Manual insight trigger: ${insightId}`);
            
            if (await insight.shouldTrigger()) {
                const message = await insight.buildMessage();
                // Send via current platform
                await EngagementManager.platform.sendMessage(message);
                
                res.json({
                    success: true,
                    message: `Insight ${insightId} triggered and sent`,
                    data: { message },
                    timestamp: new Date().toISOString()
                });
            } else {
                res.json({
                    success: true,
                    message: `Insight ${insightId} triggered but conditions not met`,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Trigger Specific Poll
    app.post('/api/engagement/trigger/poll/:pollId', async (req, res) => {
        try {
            const { pollId } = req.params;
            const poll = PollRegistry.getPoll(pollId);
            
            if (!poll) {
                return res.status(404).json({
                    success: false,
                    error: `Poll ${pollId} not found`,
                    timestamp: new Date().toISOString()
                });
            }

            console.log(`🗳️ Manual poll trigger: ${pollId}`);
            
            if (await poll.shouldTrigger()) {
                const pollData = await poll.buildMessage();
                // Send via current platform
                await EngagementManager.platform.sendPoll(pollData);
                
                res.json({
                    success: true,
                    message: `Poll ${pollId} triggered and sent`,
                    data: { poll: pollData },
                    timestamp: new Date().toISOString()
                });
            } else {
                res.json({
                    success: true,
                    message: `Poll ${pollId} triggered but conditions not met`,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Get All Insights
    app.get('/api/engagement/insights', (req, res) => {
        try {
            const insights = InsightRegistry.getAllModules();
            res.json({
                success: true,
                data: insights.map(insight => ({
                    id: insight.id,
                    name: insight.name,
                    priority: insight.priority,
                    schedule: insight.schedule,
                    status: insight.status
                })),
                count: insights.length,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Get All Polls
    app.get('/api/engagement/polls', (req, res) => {
        try {
            const polls = PollRegistry.getAllModules();
            res.json({
                success: true,
                data: polls.map(poll => ({
                    id: poll.id,
                    name: poll.name,
                    priority: poll.priority,
                    schedule: poll.schedule,
                    status: poll.status
                })),
                count: polls.length,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Start/Stop Engagement Manager
    app.post('/api/engagement/start', async (req, res) => {
        try {
            await EngagementSystem.start();
            res.json({
                success: true,
                message: 'Engagement Manager started',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    app.post('/api/engagement/stop', async (req, res) => {
        try {
            await EngagementSystem.stop();
            res.json({
                success: true,
                message: 'Engagement Manager stopped',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Get platform status
    app.get('/api/engagement/platform', (req, res) => {
        try {
            const status = EngagementSystem.getStatus();
            res.json({
                success: true,
                data: {
                    platform: status.platform,
                    isInitialized: status.isInitialized,
                    poolId: status.poolId
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // 404
    // Error handler
    app.use((err, req, res, next) => {
        debug(err);
        switch(err.code) {
            case 401:
                return res.status(err.code).send({ msg: err.msg});
            default:
                return res.status(500).send({ msg: 'oh no, we issue some problems' })
        }
    })
}

exports.setup = setup;
