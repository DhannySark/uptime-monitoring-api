/*
 * Primary file for API
 */

// Dependencies
var http = require('http');
var url = require('url');

 // Configure the server to respond to all requests with a string
var server = http.createServer(function(req,res) {

  // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // get the query string as an object
  var queryStringObject = parsedUrl.query;

  // get the HTTP method
  var method = req.method.toLowerCase();

  // Send the response
  res.end('Hello World!\n');

  // Log the request/response
  console.log('Request received on path: '+trimmedPath + ' with the method: ' +method + ' with query string parameters: ' ,queryStringObject);
});

// Start the server
server.listen(3000, function() {
  console.log('The server is up and running now');
});
