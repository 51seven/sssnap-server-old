/**
 * API Authentication module
 */

var _ = require('lodash')
  , https = require('https');

/**
 * Forbidden Error
 * @param {message} message Message to pass to error
 * @return {Error}  Error Object with status 403
 */
var Forbidden = function(message) {
  var err = new Error(message);
  err.status = 403;
  return err;
}

module.exports = function(req, res, next) {
  // Skip authentication in a no-production environment
  // Start in production with NODE_ENV=production npm start (or nodemon or whatever)
  if(process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    return next();
  }

  var access_token = req.param('access_token');

  if (access_token === undefined) {
    return next(new Forbidden('An access_token is required to access the API.'));
  }

  https.get({ host: 'www.googleapis.com', path: '/oauth2/v1/tokeninfo?access_token=' + access_token }, function(res) {
    var body = '';

    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      var resJSON = JSON.parse(body);
      if(resJSON.error === 'invalid_token') {
        return next(new Forbidden('Invalid access token'));
      } else {
        return next();
      }
    });
  }).on('error', function(err) {
    return next(new Forbidden('Error when accessing googleapis'));
  });



}