/**
 * Request handlers
 */

// dependencies
var _data = require('./data');
var helpers = require('./helpers');

// define the handlers
var handlers = {};

// users handler
handlers.users = function(data, callback) {
  var acceptableHandlers = ['post', 'get', 'put', 'delete'];
  if(acceptableHandlers.indexOf(data.method) > -1) { // if method do exit
    // pass route to user defined nethod 
    handlers._users[data.method](data, callback);
  } else {
      callback(405);
  };
};

// Container for the user submethods
handlers._users = {};

// users - post
// required data: fisrtname, phone, password, tosAgreement
handlers._users.post = function(data,callback){
    // Check that all required fields are filled out
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
  
    if(firstName && lastName && phone && password && tosAgreement) {
      // Make sure the user doesnt already exist
      _data.read('users', phone, function(err, data) {
        if(err) {
          // Hash the password
          var hashedPassword = helpers.hash(password);
  
          // Create the user object
          if(hashedPassword) {
            var userObject = {
              'firstName' : firstName,
              'lastName' : lastName,
              'phone' : phone,
              'hashedPassword' : hashedPassword,
              'tosAgreement' : true
            };
  
            // Store the user
            _data.create('users', phone, userObject, function(err) {
              if(!err) {
                callback(200);
              } else {
                console.log(err);
                callback(500, {'Error' : 'Could not create the new user'});
              }
            });
          } else {
            callback(500, {'Error' : 'Could not hash the user\'s password.'});
          }
  
        } else {
          // User alread exists
          callback(400, {'Error' : 'A user with that phone number already exists'});
        }
      });
      
    } else {
      callback(400, {'Error' : 'Missing required fields'});
    }
};

// users - get
// required data: phone
// optional data: fisrtname, phone, password, tosAgreement at least one must be specified
// @TODO only auth users can access their objects
handlers._users.get = function(data, callback) {
  // check that the phone is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone) {
    // load the user
    _data.read('users', phone, function(err, data) {
      if(!err && data) {
        // remove the hashed password before sending the req to user
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required fields'});
  }
};

// users - put
// required data: phone
// optional data: none
// @TODO only auth users can update their objects
handlers._users.put = function(data, callback) {
  // check that the phone is valid
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  
  // check for the optioal fiels
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // error if the phone is invalid
  if(phone) {
    // error if nothing is specified
    if(firstName || lastName || password) {
      // lookup the user
      _data.read('users', phone, function(err, userData) {
        if(!err && userData) {
          // update the fields necessary
          if(firstName) {
            userData.firstName = firstName;
          }
          if(lastName) {
            userData.lastName = lastName;
          }
          if(password) {
            userData.hashedPassword = helpers.hash(password);
          }

          // store the new update
          _data.update('users', phone, userData, function(err) {
            if(!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, {'Error' : 'Could not update details'});
            }
          });
        } else {
          callback(400, {'Error' : 'The specified user does not exit'});
        }
      });
    } else {
      callback(400, {'Error' : 'Missing fields to update'});
    }
  } else {
    callback(400, {'Error' : 'Missing required fields'});
  }
};

// users - delete
// required fields: phone
// @TODO only auth users can delete thier own object
// @TODO clean up all data associated with  user
handlers._users.delete = function(data, callback) {
  // check that the phone is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone) {
    // load the user
    _data.read('users', phone, function(err, data) {
      if(!err && data) {
        _data.delete('users', phone, function(err) {
          if(!err) {
            callback(200);
          } else {
            callback(500, {'Error' : 'could not delete user'});
          }
        });
      } else {
        callback(404, {'Error' : 'Could not find the specified user'});
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required fields'});
  }
};

// Tokens handler
handlers.tokens = function(data, callback) {
  var acceptableHandlers = ['post', 'get', 'put', 'delete'];
  if(acceptableHandlers.indexOf(data.method) > -1) { // if method do exit
    // pass route to user defined nethod 
    handlers._tokens[data.method](data, callback);
  } else {
      callback(405);
  };
};

// Container for the user submethods
handlers._tokens = {};

// tokens - get
// required data: phone, password
// optional data: none
handlers._tokens.get = function(data, callback) {
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if(phone && password) {
    // lookup the user who matached the phone number
    _data.read('users', phone, function(err, userData) {
      if(!err && userData) {
        // hash the sent password and compared it to the saved password in user data
        var hashedPassword = helpers.hash(password);
        if(hashedPassword == userData.hashedPassword) {
          // if valid, create a new token with a random name,set expiration data 1 hour in the future
          // timeLine: 7:28
        } else {
          callback(400, {'Error' : 'password did not match the specified user\'s password'})
        }
      } else {
        callback(400, {'Error' : 'could not find the specified user'});
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required fields'});
  }
}

// tokens - put
handlers._tokens.put = function(data, callback) {}

// tokens - update
handlers._tokens.update = function(data, callback) {}

// tokens - delete
handlers._tokens.delete = function(data, callback) {}

// ping handler
handlers.ping = function(data, callback) {
  callback(200);
};

// not found handler
handlers.notfound = function(data, callback) {
  callback(404);
};

//export the handlers
module.exports = handlers;