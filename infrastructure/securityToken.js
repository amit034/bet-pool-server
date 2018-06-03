const mongoose = require('mongoose');
const Q = require('q');
const _ = require('lodash');

const securityTokenSchema = mongoose.Schema({
	apiAccessToken: {type: String, required: true, index: {unique: true}},
	issueDate: {type: Date, required: true},
	expirationDate: {type: Date, required: true},
	userId: {type: [mongoose.Schema.ObjectId], required: true},
	providerAccessToken: {type: String, required: false}
});

securityTokenSchema.methods.isExpired = function() {
	return Date.now() > this.expirationDate;
};

securityTokenSchema.statics.createFromApiAndProviderToken = function(apiToken, providerToken) {
	if (!apiToken || apiToken.accessToken < 32 || !providerToken || providerToken.length === 0) {
		throw new Error('The Api access token and the Facebook user access token are required');
	}
    const obj = new SecurityToken();
	obj.apiAccessToken = apiToken.accessToken;
	obj.issueDate = apiToken.issueDate;
	obj.expirationDate = apiToken.expirationDate;
	obj.application = apiToken.application;
	obj.userId = apiToken.userId;
	obj.providerAccessToken = _.toString(providerToken);
	return obj;
};

securityTokenSchema.statics.createFromApiToken = function(apiToken) {
    if (!apiToken || apiToken.accessToken < 32 ) {
        throw new Error('The Api access token and the Facebook user access token are required');
    }
    var obj = new SecurityToken();
    obj.apiAccessToken = apiToken.accessToken;
    obj.issueDate = apiToken.issueDate;
    obj.expirationDate = apiToken.expirationDate;
    obj.userId = apiToken.userId;
    return obj;
};
securityTokenSchema.statics.saveSecurityToken = function(securityToken) {
	var deferred = Q.defer();
	try {
		securityToken.save(function(err, savedSecurityToken) {
			if (err) {
				deferred.reject(new Error(err));
			}
			else {
				deferred.resolve(savedSecurityToken);
			}
		});
	}
	catch (e) {
		deferred.reject(e);
	}
	return deferred.promise;
};

securityTokenSchema.statics.findSecurityToken = function(apiAccessToken) {
	var deferred = Q.defer();
	var query = {
		apiAccessToken: apiAccessToken
	};
	SecurityToken.findOne(
		query,
		function(err, foundSecurityToken) {
			if (err) {
				deferred.reject(new Error(err));
			}
			else {
				deferred.resolve(foundSecurityToken);
			}
		}
	);
	return deferred.promise;
};

securityTokenSchema.statics.findSecurityTokenFromUserId = function(userId) {
    var deferred = Q.defer();
    var query = {
        userId: userId
    };
    SecurityToken.findOne(
        query,
        function(err, foundSecurityToken) {
            if (err) {
                deferred.reject(new Error(err));
            }
            else {
                deferred.resolve(foundSecurityToken);
            }
        }
    );
    return deferred.promise;
};
securityTokenSchema.statics.removeSecurityToken = function(apiAccessToken) {
	return SecurityToken.remove({ apiAccessToken: apiAccessToken });
};

securityTokenSchema.statics.removeSecurityTokensForUserId = function(userId) {
  var deferred = Q.defer();
  SecurityToken.remove({ userId: userId }, function (err) {
    if (err) {
      console.log("In removeSecurityToken: " + err);
      deferred.reject(err);
    }
    else {
      deferred.resolve(userId);
    }
  });
  return deferred.promise;
};

securityTokenSchema.statics.authorise = function(apiAccessToken) {
  var deferred = Q.defer();
  SecurityToken.findSecurityToken(apiAccessToken)
    .then(function(securityToken) {
      if (securityToken !== null && !securityToken.isExpired()) {
          deferred.resolve(true);
      }
      else {
          deferred.resolve(false);
      }
    })
    .fail(function(err) {
      deferred.resolve(false);
    });
  return deferred.promise;
};

var SecurityToken = mongoose.model('SecurityToken', securityTokenSchema);

module.exports = SecurityToken;
