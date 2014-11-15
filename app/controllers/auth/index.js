/**
 * Authorization provider switch
 */

var status = require('../../helpers/status');

module.exports = function(req, res, next) {
  var provider = req.get('x-auth-provider') || req.query.provider;

  switch(provider) {
    case 'google':
      return require('./' + provider)(req, res, next);
      break;
    default:
      return next(status.Forbidden('No authentication provider found. You have to add the name of your provider in the HTTP header or in the URL path.'))
  }
}