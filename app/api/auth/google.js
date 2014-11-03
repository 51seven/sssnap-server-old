/**
 * API Authentication module
 */

var _ = require('lodash')
  , https = require('https')
  , Promise = require('bluebird')
  , mongoose = require('mongoose');

var User = mongoose.model('User');

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

function googleAPI(path, access_token) {
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
          reject(new Forbidden('Invalid access token'));
        } else {
          resolve(resJSON);
        }
      });

    }).on('error', function(err) {
      reject(new Forbidden('Error when accessing googleapis'));
    });
  });
}

module.exports = function(req, res, next) {
  // Skip authentication in a no-production environment
  // Start in production with NODE_ENV=production npm start (or nodemon or whatever)
  if(process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    return next();
  }

  var access_token;
  var headerAuth = req.get('Authorization');

  // Get access token from HTTP Header or from URL parameter
  if(headerAuth) access_token = headerAuth.substring(7);
  else access_token = req.param('access_token');

  if (access_token === undefined) {
    return next(new Forbidden('An access_token is required to access the API'));
  }

  var tokenInfo, userInfo;

  googleAPI('/oauth2/v1/tokeninfo?access_token=' + access_token, access_token).then(function(token) {
    tokenInfo = token;

    // TODO:
    // if audience !== allowed client
    //   throw new Error

    // Check correct scopes
    var scopes = tokenInfo.scope.split(' ');

    if(scopes.indexOf('https://www.googleapis.com/auth/plus.me') === -1 || scopes.indexOf('https://www.googleapis.com/auth/userinfo.email') === -1) {
      throw new Forbidden('userinfo.email and plus.me scope is required');
    }

    // Retreive user info
    return googleAPI('/plus/v1/people/' + tokenInfo.user_id, access_token);
  }).then(function(user) {
    userInfo = user;

    var imageUrl = userInfo.image.url;

    userInfo.image.url = imageUrl.substring(0, imageUrl.length - 6);

    // Create new user or update the image of an existing user
    return User.createOrUpdate({ imageUrl: userInfo.image.url, email: tokenInfo.email, externalId: tokenInfo.user_id, name: userInfo.displayName, provider: 'google'});
  }).then(function(user) {
    // Saving the user in the current request
    req.user = user.response;

    next();
  }).catch(function(err) {
    next(err);
  });
}