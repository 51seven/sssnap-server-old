var https = require('https')
  , Promise = require('bluebird');

var status = require('./status');

exports.callAPI = function(path, access_token) {
  return new Promise(function(resolve, reject) {
    https.get({
      host: 'www.googleapis.com',
      path: path,
      headers: { 'Authorization': 'Bearer ' + access_token }
    }, function(res) {
      var body = '';

      // Collect received body chunks
      res.on('data', function(chunk) {
        body += chunk;
      });

      // parse received body as JSON
      res.on('end', function() {
        var resJSON = JSON.parse(body);
        if(resJSON.error === 'invalid_token') {
          reject(new status.Forbidden('Invalid access token'));
        } else {
          resolve(resJSON);
        }
      });

    }).on('error', function(err) {
      reject(new status.Forbidden('Error when accessing googleapis'));
    });
  });
}