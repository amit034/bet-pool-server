module.exports = {
	"db": {
		"mongodb": "mongodb://api:239rtjss9akjksf82@ds035787.mongolab.com:35787/shopwithme",
		"sequelize": {
			HOST: "localhost",
			USER: "root",
			PASSWORD: "arotbard",
			DB: "betPool",
			dialect: "mysql",
			pool: {
				max: 5,
				min: 0,
				acquire: 30000,
				idle: 10000
			}
		}
	},
	"bots": {
		"crowd": {
			"email" : "crowdbot@365win.bet",
			"username": "crowdbot@365win.bet",
			"firstName": "Crowd",
			"lastName": "bot",
			"password": "Aa123456"
		}
	},
	// 'facebookAuth' : {
	// 	'clientID'      : 'your-clientID-here',
	// 	'clientSecret'  : 'your-client-secret-here',
	// 	'callbackURL'     : 'http://localhost:3000/api/auth/facebook/callback',
	// 	'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email'
    //
	// },
    //
	// 'twitterAuth' : {
	// 	'consumerKey'        : 'your-consumer-key-here',
	// 	'consumerSecret'     : 'your-client-secret-here',
	// 	'callbackURL'        : 'http://localhost:3000/auth/twitter/callback'
	// },
	// 'googleAuth' : {
	// 	'clientID'         : 'your-clientID-here',
	// 	'clientSecret'     : 'your-client-secret-here',
	// 	'callbackURL'      : 'http://localhost:3000/auth/google/callback'
	// },
	"logger": {
		"api": "logs/api.log",
		"exception": "logs/exceptions.log"
	}
};