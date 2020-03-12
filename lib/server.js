/**
 * These are server-related-tasks
 * 
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');

// instanciate the server module object
var server = {};

// instanciate the http server
server.httpServer = http.createServer(function(req,res) {
  server.unifiedServer(req, res);
});

// instantiate the https server
server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions, function(req,res) {
    server.unifiedServer(req, res);
});

// all the server logic for both the http and the https server
server.unifiedServer = function(req, res) {
  
  // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // get the query string as an object
  var queryStringObject = parsedUrl.query;

  // get the HTTP method
  var method = req.method.toLowerCase();

  // get the headers as an object
  var headers = req.headers;

  // get the payload if there is any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data) {
    buffer += decoder.write(data);
  });
  req.on('end', function() {
    buffer += decoder.end();

    // choose the handler the request should go to, if not found route to not found
    var choosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notfound;

    // construct the data object to send to the handler
    var data = {
      'trimedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
    }

    // route the request to the handler specified in the router
    choosenHandler(data, function(statusCode, payload) {
      // use the status code called back by the handler or defalut to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // use the payload code called back by the handler or defalut
      payload = typeof(payload) == 'object' ? payload : {};

      // convert the payload to a string
      var payloadString = JSON.stringify(payload);

      // Return the reponse
      res.setHeader('content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log the request/response
      console.log('Returning this response: ', statusCode, payload);
    });
  });
};

//define a request router
server.router = {
  'ping': handlers.ping,
  'users': handlers.users,
  'tokens': handlers.tokens,
  'checks': handlers.checks
};

// init script
server.init = function() {
    // start the http server
    server.httpServer.listen(config.httpPort, function() {
        console.log('The server is up and running ' + config.httpPort + ' now');
    });
  
    /// start the https server
    server.httpsServer.listen(config.httpsPort, function() {
        console.log('The server is up and running ' + config.httpsPort + ' now');
    });
};

// Export the server
module.exports = server;