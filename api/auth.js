/**
 * API Authentication module
 */

var _ = require('lodash')
  , md5 = require('MD5')
  , crypto = require('crypto')
  , Promise = require('bluebird');

/**
 * takes the HTTP body as JSON, converts it
 * into raw data, hashes it with md5 and returns
 * it as base64
 * @param  {Object} body req.body
 * @return {String}      hashed and base64'd string
 */
function convertBodyToHash(body) {
  var raw = "";
  var pair;
  var hash;
  _.forEach(body, function(value, key) {
    pair = key + "=" + value + "&";
    raw += pair;
  });
  raw = raw.substring(0, raw.length - 1);
  hash = md5(raw);
  return new Buffer(hash).toString('base64');
}

/**
 * takes a string and encrypt it using HMAC-SHA1
 * using a key
 * @param  {String} str    String to encrypt
 * @param  {String} key    Key to use for encryption
 * @return {String}        Hash as HEX
 */
function createHMAC(str, key) {
  var hash;
  hash = crypto.createHmac('sha1', key).update(str).digest('hex');
  return new Buffer(hash).toString('base64');
}

/**
 * extracts the public key and the signature from
 * the Authorization header
 * @param  {String} str Authorization header
 * @return {Array}      <Public Key|Signature>
 */
function extractAuthorization(str) {
  str = str.substring(4);
  var cred = str.split(":");
  return cred;
}

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
  if(process.env.NODE_ENV !== 'production') {
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
  else HashedData = convertBodyToHash(req.body);

  // Building the String, which will be
  // encrypted using HMAC-SHA1 and become
  // the signature
  var StringToSign =
    HTTPVerb + "\\n" +
    URLPath + "\\n" +
    HashedData + "\\n" +
    headerISODate;

  // this signature should match the signature
  // send in the Authorization header
  var buildSignature = createHMAC(StringToSign, "secret");

  // Taking the authorization header and extract
  // the public key and the signature
  var authorization = extractAuthorization(req.get('Authorization'));
  var publicKey = authorization[0];
  var authSignature = authorization[1];

  if(buildSignature !== authSignature) {
    return next(new Forbidden('Authorization code invalid'));
  } else {
    // arrive here and you have access to the api
    next();
  }
}