var Account = require('../models/Account');
var logger = require('../utils/logger');
var Q = require('q');

function AccountRepository() {
	this.findById = findAccountById;
	//this.addShoppingListToUser = addShoppingListToUser;
	//this.removeShoppingListFromUser = removeShoppingListFromUser;
	this.createAccount = createAccount;
	this.findAccountByQuery = findAccountByQuery;
    this.findActiveAccountsByIds  =findActiveAccountsByIds;
    this.findAccountByUsernamePassword = findAccountByUsernamePassword;
	this.updateAccount = updateAccount;
	this.updateLastLoginDate = updateLastLoginDate;
	this.disableAccount = disableAccount;
	this.findOrCreateAccount = findOrCreateAccount;
}

function findAccountById(id) {
	var deferred = Q.defer();
	var query = {
		_id: id
	};
	Account.findOne(query, function(err, profile) {
		if (err) {
			deferred.reject(new Error(err));
		}
		else {
			deferred.resolve(profile);
		}
	});
	return deferred.promise;
}

function findActiveAccountsByIds(ids) {
    var deferred = Q.defer();
    var query = {
        _id: {$in: ids},
        isActive : true
    };
    Account.find(query, function(err, accounts) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            deferred.resolve(accounts);
        }
    });
    return deferred.promise;
}
// function addShoppingListToUser(profile, listId) {
// 	var deferred = Q.defer();
// 	// Let's add this new shopping list to the list contained in the profile
// 	profile.shoppingLists.addToSet(listId);
// 	profile.save(function(err, profile) {
// 		if (err) {
// 			deferred.reject(new Error(err));
// 		}
// 		else {
// 			deferred.resolve(profile);
// 		}
// 	});
// 	return deferred.promise;
// }
//
// function removeShoppingListFromUser(profile, listId) {
// 	var deferred = Q.defer();
// 	if (profile.shoppingLists && profile.shoppingLists.length > 0) {
// 		if (profile.shoppingLists.indexOf(listId) > -1) {
// 			profile.shoppingLists.pull(listId);
// 			profile.save(function(err, profile) {
// 				if (err) {
// 					deferred.reject(new Error(err));
// 				}
// 				else {
// 					deferred.resolve(profile);
// 				}
// 			});
// 		}
// 		else {
// 			deferred.reject(new Error('No such id'));
// 		}
// 	}
// 	else {
// 		deferred.reject(new Error('Shopping list is empty for this user'));
// 	}
// 	return deferred.promise;
// }

function createAccount(username, password, firstName, lastName, email, facebookUserId) {
	var account = new Account({
		username: username,
		password: password,
		firstName: firstName,
		lastName: lastName,
		facebookUserId: facebookUserId || null,
		email: email
	});
	return account.save();
}

function findAccountByQuery(query) {
    return Account.findOne(query);
}
function findAccountByUsernamePassword(username,password) {
    var deferred = Q.defer();
    Account.findOne({
        username: username,
        password : password
    }, function(err, foundUsername) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            deferred.resolve(foundUsername);
        }
    });
    return deferred.promise;
}



function updateAccount(account) {
	var query = {
		username: account.username
	};
	var options = {
		'new': true
	};
	return Account.findOneAndUpdate(query,
		{
			firstName: account.firstName,
			lastName: account.lastName,
			email: account.email
		},
		options);
}

function updateLastLoginDate(account, lastLogin) {
	var query = {
		username: account.username
	};
	return Account.findOneAndUpdate(query, {lastLogin: lastLogin}, {'new': true});
}

function disableAccount(userId) {
	var deferred = Q.defer();
	var query = {
		_id: userId
	};
	var options = {
		'new': true
	};
	Account.findOneAndUpdate(query,
		{
			isActive: false,
			canLogin: false
		},
		options,
		function(err, account) {
			if (err) {
				deferred.reject(new Error(err));
			}
			else {
				deferred.resolve(account);
			}
		}
	);
	return deferred.promise;
}

// Attempt to find an existing account by username, and if it cannot find it, it creates it
// userProfile is of type UserProfile from Passport.js. See http://passportjs.org/guide/profile/
function findOrCreateAccount(username, facebookUserId, email, firstName, lastName) {
	return this.findAccountByQuery({email})
	.then(function(account) {
		if (account && account.username && account.username !== '') {
			return Promise.resolve(account); // Found!
		}
		else {
			return createAccount(username, ' ', firstName, lastName, email, facebookUserId);
		}
	});
}

module.exports = AccountRepository;
