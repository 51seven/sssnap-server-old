/**
 * API Authentication module
 */

var _ = require('lodash');

var helper = require('./helper');

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

  // Check if the route starts with /api/
  // otherwise the authentication will become operative
  // on every 404 route
  if((req.originalUrl).substring(0, 5) !== '/api/') {
    return next();
  }

  // Check if Authorization header field is available
  if(req.get('Authorization') === undefined) {
    return next(new Forbidden('No Authorization code found in HTTP header'));
  }

  // Check if x-snp-date header field is available
  if(req.get('x-snp-date') === undefined) {
    return next(new Forbidden('No x-snp-date found in HTTP header'));
  }

  var headerISODate = req.get('x-snp-date');

  // Check if x-snp-date header field is in UTC ISO format
  if(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/.test(req.get('x-snp-date')) === false) {
    return next(new Forbidden('x-snp-date is not a valid UTC ISO format'));
  }

  var headerDate = Date.parse(req.get('x-snp-date'));

  // Check if access expired (older than 5 minutes)
  var dateCompare = (new Date) - headerDate;
  if(dateCompare > 300000 || dateCompare < -30000) {
    return next(new Forbidden('Authentication expired'));
  }

  // Getting HTTP Verb and Requested Path
  // for building String to sign later
  var HTTPVerb = req.method;
  var URLPath = req.originalUrl;

  // Building Hashed Data from req.body
  // for building String to sign later
  var HashedData;
  if(_.isEmpty(req.body)) HashedData = "";
  else HashedData = helper.convertBodyToHash(req.body);

  // Building the String, which will be
  // encrypted using HMAC-SHA1 and become
  // the signature
  var StringToSign =
    HTTPVerb + "\n" +
    URLPath + "\n" +
    HashedData + "\n" +
    headerISODate;

  // this signature should match the signature
  // send in the Authorization header
  var buildSignature = helper.createHMAC(StringToSign, "secret");

  // Taking the authorization header and extract
  // the public key and the signature
  var authorization = helper.extractAuthorization(req.get('Authorization'));
  var publicKey = authorization[0];
  var authSignature = authorization[1];

  if(buildSignature !== authSignature) {
    return next(new Forbidden('Authorization code invalid'));
  } else {
    // arrive here and you have access to the api
    next();
  }
}