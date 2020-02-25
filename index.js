/*
 * Primary file for API
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var fs = require('fs');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');

// instanciate the http server
var httpServer = http.createServer(function(req,res) {
  unifiedServer(req, res);
});

// Start the server
httpServer.listen(config.httpPort, function() {
  console.log('The server is up and running ' + config.httpPort + ' now');
});

// instantiate the https server
var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions, function(req,res) {
  unifiedServer(req, res);
});

// start the https server
httpsServer.listen(config.httpsPort, function() {
  console.log('The server is up and running ' + config.httpsPort + ' now');
});

// all the server logic for both the http and the https server
var unifiedServer = function(req, res) {
  
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
    var choosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notfound;

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
var router = {
  'ping': handlers.ping,
  'users': handlers.users,
  'tokens': handlers.tokens,
  'checks': handlers.checks
};
