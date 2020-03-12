/*
 * Primary file for API
 */


// Dependendcies
var server = require('./lib/server');
var workers = require('./lib/workers');

// Declare the app
var app = {};

// Init function
app.init = function() {
  // start the servers
  server.init();

  // start the workers
  workers.init();
  
};

// Execute
app.init();

// Export the app
module.exports = app;