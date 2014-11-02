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

function askGoogle(access_token) {
  return new Promise(function(resolve, reject) {
    https.get({ host: 'www.googleapis.com', path: '/oauth2/v1/tokeninfo?access_token=' + access_token }, function(res) {
      var body = '';

      res.on('data', function(chunk) {
        body += chunk;
      });
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

// TODO:
// This is so redundant, extract it as a function

function getUserData(user_id, access_token) {
  return new Promise(function(resolve, reject) {
    https.get({
      host: 'www.googleapis.com',
      path: '/plus/v1/people/' + user_id,
      headers: { 'Authorization': 'Bearer ' + access_token }
    }, function(res) {
      var body = '';

      res.on('data', function(chunk) {
        body += chunk;
      });
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

  var access_token = req.param('access_token');

  if (access_token === undefined) {
    return next(new Forbidden('An access_token is required to access the API.'));
  }

  var tokenInfo;

  askGoogle(access_token).then(function(token) {
    tokenInfo = token;
    // TODO:
    // if audience !== allowed client
    //   throw new Error

    return User.checkExistence({ id: token.user_id, provider: 'google' });
  }).then(function(check) {
    if(check) {
      req.user = check;
      return;
    } else {
      return getUserData(tokenInfo.user_id, access_token);
    }
  }).then(function(userdata) {
    if(userdata) return User.create({ email: tokenInfo.email, id: tokenInfo.user_id, provider: 'google', name: userdata.displayName });
    else return;
  }).then(function(createdUser) {
    if(createdUser) req.user = createdUser;
    next();
  }).catch(function(err) {
    next(err);
  });
}