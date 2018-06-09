module.exports = {
	"db": {
		//"mongodb": "mongodb://testUser:testpassword@ds045077.mongolab.com:45077/shopwithmetest"
		// Localhost
		"mongodb": "mongodb://nodejs:node@ds045521.mongolab.com:45521/betpool"
	},
	"bots": {
		"crowdBot": {
			"email" : "crowdbot@365win.bet",
			"username": "crowdbot@365win.bet",
			"firstName": "Crowd",
			"lastName": "bot",
			"password": "Aa123456"
		}
	},
	"logger": {
		"api": "logs/api.log",
		"exception": "logs/exceptions.log"
	}
};