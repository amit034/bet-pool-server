module.exports = {
    "db": {
        //"mongodb": "mongodb://testUser:testpassword@ds045077.mongolab.com:45077/shopwithmetest"
        // Localhost
        "mongodb": "mongodb://nodejs:node@ds045521.mongolab.com:45521/betpool"
    },
    "bots": {
        "crowdBot": {
            "email": "crowdbot@365win.bet",
            "username": "crowdbot@365win.bet",
            "firstName": "Crowd",
            "lastName": "Bot",
            "password": "Aa123456"
        },
        "smartBot": {
            "email": "smartBot@365win.bet",
            "username": "smartBot@365win.bet",
            "firstName": "Smart",
            "lastName": "Bot",
            "password": "Aa123456"
        },
        "monkeyBot": {
            "email": "monkeyBot@365win.bet",
            "username": "monkeyBot@365win.bet",
            "firstName": "Monkey",
            "lastName": "Bot",
            "password": "Aa123456"
        },
        "crazyBot": {
            "email": "crazyBot@365win.bet",
            "username": "crazyBot@365win.bet",
            "firstName": "Crazy",
            "lastName": "Bot",
            "password": "Aa123456"
        }
    },
    "logger": {
        "api": "logs/api.log",
        "exception": "logs/exceptions.log"
    }
};