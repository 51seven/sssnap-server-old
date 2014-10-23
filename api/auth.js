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

module.exports = function(req, res, next) {
  // Skip authentication in a no-production environment
  // Start in production with NODE_ENV=production npm start (or nodemon or whatever)
  if(process.env.NODE_ENV !== 'production') {
    return next();
  }

  // TODO: Sending a message with next won't work, res.status() won't work

  // Check if Authorization header field is available
  if(req.get('Authorization') === undefined) {
    res.status(403);
    return next('No Authorization code found in HTTP header');
  }

  // Check if x-snp-date header field is available
  if(req.get('x-snp-date') === undefined) {
    res.status(403);
    return next('No x-snp-date found in HTTP header')
  }

  var headerISODate = req.get('x-snp-date');


  // TODO: Something fails here
  // Check if x-snp-date header field is in UTC ISO format
  /*if(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/.test(req.get('x-snp-date')) === false) {
    res.status(403);
    return next('x-snp-date is not a valid UTC ISO format')
  }*/

  var headerDate = Date.parse(req.get('x-snp-date'));

  // TODO: Something fails here
  // Check if access expired (older than 5 minutes)
  /*if(((new Date) - headerDate) < 300000) {
    res.status(403);
    return next('Authentication expired')
  }*/


  // TODO: Document
  var HTTPVerb = req.method;
  var URLPath = req.originalUrl;
  var HashedData;

  if(_.isEmpty(req.body)) HashedData = "";
  else HashedData = convertBodyToHash(req.body);

  var StringToSign =
    HTTPVerb + "\\n" +
    URLPath + "\\n" +
    HashedData + "\\n" +
    headerISODate;

  console.log(StringToSign);

  // this signature should match the signature
  // send in the Authorization header
  var signature = createHMAC(StringToSign, "secret");

  var authorization = extractAuthorization(req.get('Authorization'));
  console.log(authorization);
  var publicKey = authorization[0];
  var checkSignature = authorization[1];

  console.log(signature);
  console.log(checkSignature);

  if(signature !== checkSignature) {
    console.log('invalid');
    res.status(403);
    return next('Authorization code invalid')
  } else {
    next();
  }
}