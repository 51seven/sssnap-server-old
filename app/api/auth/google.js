/**
 * API Authentication module
 */

var _ = require('lodash')
  , Promise = require('bluebird')
  , mongoose = require('mongoose');

var google = require('../../helper/google')
  , status = require('../../helper/status');

var User = mongoose.model('User');


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
    return next(new status.Forbidden('Access token not found. Send the access token in the HTTP Authorization Header or in the URL.'));
  }

  var tokenInfo;

  google.callAPI('/oauth2/v1/tokeninfo?access_token=' + access_token, access_token).then(function(token) {
    tokenInfo = token;

    // TODO:
    // if audience !== allowed client
    //   throw new Error

    // Check correct scopes
    var scopes = tokenInfo.scope.split(' ');

    if(scopes.indexOf('https://www.googleapis.com/auth/plus.me') === -1 || scopes.indexOf('https://www.googleapis.com/auth/userinfo.email') === -1) {
      throw new Forbidden('Access token has wrong scopes. userinfo.email and plus.me scope is required.');
    }

    // Get user from db
    return User.load({ criteria: { externalId: tokenInfo.user_id, provider: 'google' } });
  }).then(function(user) {
    // Saving the user in the current request
    if(req.user) req.user = user.response;
    else req.user = {};

    req.user.token_info = tokenInfo;
    req.user.access_token = access_token;

    if(req.route.path !== '/api/user' && req.user === undefined) {
      throw new status.Forbidden('User is not yet in the database. Authorization was successful. Call /api/user to authenticate the user.');
    }

    next();
  }).catch(function(err) {
    next(err);
  });
}