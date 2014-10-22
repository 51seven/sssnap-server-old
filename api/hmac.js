/**
 * generates a base64 HMAC with sha256
 * @param  {String} data      Data to hash
 * @param  {String} secret    Secret Key
 * @param  {String} algorithm Hash algorithm
 * @param  {String} encoding  Encoding of the output
 * @return {String}           Hashed data with secret, HMAC
 */
function generateHmac(data, secret, algorithm, encoding) {
  encoding = encoding || "base64";
  algorithm = algorithm || "sha256";
  return crypto.createHmac(algorithm, secret).update(data).digest(encoding);
}

/**
 * convert JSON body object to raw http head data
 * @param  {Object} body Payload to convert
 * @return {String}      Converted Payload
 */
function toRaw(body) {
  if(_.isEmpty(body)) {
    return false;
  } else {
    console.log("not empty");
    var rawstring = "";
    var pair = "";
    _.forEach(body, function(value, key) {
      pair = key + "=" + value + "&";
      rawstring += pair;
    });
    return rawstring.substring(0, rawstring.length - 1);
  }
}