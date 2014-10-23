/**
 * API Authentication module
 */

var _ = require('lodash');

module.exports = function(req, res, next) {
  if(process.env.NODE_ENV === 'development') {
    return next();
  }
}