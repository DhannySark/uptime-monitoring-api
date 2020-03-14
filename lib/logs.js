/**
 * lib for storing and rotating logs
 */

// dependencies
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

// container for the module
var lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname,'/../.logs/');

// Append a string to a file. Create the file if it does not exist
lib.append = function(file,str,callback){
  // Open the file for appending
  fs.open(lib.baseDir+file+'.log', 'a', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // Append to file and close it
      fs.appendFile(fileDescriptor, str+'\n',function(err){
        if(!err){
          fs.close(fileDescriptor,function(err){
            if(!err){
              callback(false);
            } else {
              callback('Error closing file that was being appended');
            }
          });
        } else {
          callback('Error appending to file');
        }
      });
    } else {
      callback('Could open file for appending');
    }
  });
};

// list all the logs, and optionally include the compressed logs
lib.list = function(includeCompressedLogs, callback) {
    fs.readdir(lib.baseDir, function(err, data) {
        if(!err && data.length > 0) {
            var trimmedFileName = [];
            data.forEach(function(fileName) {
                // add the .log files
                if(fileName.indexOf('.log') > -1) {
                    trimmedFileName.push(fileName.replace('.log',''));
                }

                // add the .gz file
                if (fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
                    trimmedFileName.push(fileName.replace('.gz.b64',''));
                }
            });
            callback(false, trimmedFileName);
        } else {
            callback(err, data);
        }
    });
};

// compress the contents of one .log file into a .gz.b64 within the same directory
lib.compress = function(logId, fileId, callback) {
    var sourceFile = logId+'.log';
    var destFile = newFile+'.gz.b64';

    // read the source files
    fs.readFile(lib.baseDir+sourceFile, 'utf8', function(err, inputString) {
        if(!err && inputString) {
            // compress the data using g-zip
            zlib.gzip(inputString, function(err, buffer) {
                if(!err && buffer) {
                    // send the data to the destination file
                    fs.open(lib.baseDir+destFile+'wt', function(err, fileDescriptor) {
                        // ..
                        // timeline 32:46
                    });
                } else {
                    callback(err);
                }
            });
        } else {
            callback(err);
        }
    });
};

// export the module
module.exports = lib;
