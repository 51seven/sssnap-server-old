var _ = require('lodash')
  , crypto = require('crypto');

/**
 * takes the HTTP body as JSON, converts it
 * into raw data, hashes it with md5 and returns
 * it as base64
 * @param  {Object} body req.body
 * @return {String}      hashed and base64'd string
 */
exports.convertBodyToHash = function(body) {
  var raw = "";
  var pair;
  var hash;
  _.forEach(body, function(value, key) {
    pair = key + "=" + value + "&";
    raw += pair;
  });
  raw = raw.substring(0, raw.length - 1);
  hash = crypto.createHash('md5').update(raw).digest('hex');
  var result = new Buffer(hash).toString('base64');
  return result;
}

/**
 * takes a string and encrypt it using HMAC-SHA1
 * using a key
 * @param  {String} str    String to encrypt
 * @param  {String} key    Key to use for encryption
 * @return {String}        Hash as HEX
 */
exports.createHMAC = function(str, key) {
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
exports.extractAuthorization = function(str) {
  str = str.substring(4);
  var cred = str.split(":");
  return cred;
}