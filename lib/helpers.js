/*
 * Helpers for various tasks
 *
 */

// Dependencies
var config = require('./config');
var crypto = require('crypto');

// Container for all the helpers
var helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str){
  try{
    var obj = JSON.parse(str);
    return obj;
  } catch(e){
    return {};
  }
};

// Create a SHA256 hash
helpers.hash = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// create a random string of alphanumeric characters, of a given string
helpers.createRandomString = function(stringLenth) {
  stringLenth = typeof(stringLenth) == 'number' && stringLenth > 0 ? stringLenth : false;
  if(stringLenth) {
    // define possible characters that could go into the string
    var possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // start the final string
    var str = '';
    for(i=1; i<=stringLenth; i++) {
      // get the random character from the possible characters
      var randomChar = possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
      // append the char to the final string
      str+=randomChar;
    }

    // return the final string
    return str;
  } else {
    return false;
  }
};

// Export the module
module.exports = helpers;
