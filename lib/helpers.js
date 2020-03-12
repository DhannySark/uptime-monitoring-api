/*
 * Helpers for various tasks
 *
 */

// Dependencies
var config = require('./config');
var crypto = require('crypto');
var https = require('https');
var queryString = require('querystring');

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

// Send an SMS message via twilio
helpers.sendTwilioSms = function(phone, msg, callback) {
  // validate parameters
  phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
  msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 100 ? msg.trim() : false;
  if (phone && msg) {
    // configure the request payload
    var payload = {
      'From': config.twilio.fromPhone,
      'To': '+233' + phone,
      'Body': msg
    }

    // stringify the payload
    var stringPayload = queryString.stringify(payload);

    // configure the request details
    var requestDetails = {
      'protocol': 'https:',
      'hostname': 'api.twilio.com',
      'method': 'POST',
      'path': '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
      'auth': config.twilio.accountSid+':'+config.twilio.authToken,
      'headers': {
        'content-Type': 'application/x-www-form-urlencoded',
        'content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    var req = https.request(requestDetails, function(res) {
      // grab the status of the send req
      var status = res.statusCode;

      // callback success if req went through
      if(status == 200 || status == 201) {
        callback(false);
      } else {
        callback('status code returned was '+status);
      }
    });

    // bind to the err event so that it doesn't get thrown
    req.on('error', function(e) {
      callback(e);
    });

    // add the payload
    req.write(stringPayload);

    // end the req
    req.end();

  } else {
    callback('Given parameters were missing or invalid');
  }
};

// Export the module
module.exports = helpers;
