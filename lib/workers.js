/**
 * these are workers related tasks
 * 
 */

// Dependencies
var path = require('path');
var fs = require('fs');
var _data = require('./data');
var https = require('https');
var http = require('http');
var helpers = require('./helpers');
var url = require('url');

// instantiate the workers object
var workers = {};

// lookup all checks, get their data, send to a validator
workers.gatherAllChecks = function() {
    // get all the checks
    _data.list('checks', function(err, checks) {
        if (!err && checks && checks.length > 0) {
            // Read in the check data
            checks.forEach(check => {
                _data.read('checks', check, function(err, originalCheckData) {
                    if (!err && originalCheckData) {
                        // pass it to the check validator, and let that function continue ot log err
                        workers.validateCheckData(originalCheckData);
                    } else {
                        console.log('Error reading one of the checks');
                    }
                });
            });
        } else {
            console.log('Error: Could not find any check to process');
        }
    });
};

// Sanity-check the check data
workers.validateCheckData = function(originalCheckData) {
    originalCheckData = typeof(originalCheckData) == 'object' && originalCheckData !== null ? originalCheckData : {};
    originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id.trim() : false;
    originalCheckData.userPhone = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 10 ? originalCheckData.userPhone.trim() : false;
    originalCheckData.protocol = typeof(originalCheckData.protocol) == 'string' && ['http', 'https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
    originalCheckData.url = typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false;
    originalCheckData.method = typeof(originalCheckData.method) == 'string' && ['get', 'post', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
    originalCheckData.successCodes = typeof(originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
    originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 0 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds.trim() : false;

    // set the key that may be set (if the workers have never seen this check before)
    originalCheckData.state = originalCheckData.state = typeof(originalCheckData.state) == 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
    originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked.trim() : false;

    // if all the checks pass, pass the data along the next step in the process
    //  timeline --- 33:07
};

// timer to execute the worker-process once per minute
workers.loop = function() {
    setTimeout(function() {
        workers.gatherAllChecks();
    }, 1000 * 60);
};

// init the script
workers.init = function() {
    // execute all the checks immediately
    workers.gatherAllChecks();

    // call the loop so the checks will execute later on
    workers.loop();
}

// Export the module
module.exports = workers;