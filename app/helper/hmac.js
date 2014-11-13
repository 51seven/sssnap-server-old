var crypto = require('crypto')
  , config = require('config');


function md5AsBase64(string) {
  var hash = crypto.createHash('md5').update(string).digest('hex');
  var result = new Buffer(hash).toString('base64');
  return result;
}

function hmacAsBase64(string) {
  var hash = crypto.createHmac('sha1', config.secret.signkey).update(string).digest('hex');
  var result = new Buffer(hash).toString('base64');
  return result;
}

exports.createSignature = function (destination, userid, filename, time) {
  var payload = "userid=" + userid + "&filename=" + filename;
  var stringToSign =
    destination + '\n' +
    md5AsBase64(payload) + '\n' +
    time.getTime();

  return hmacAsBase64(stringToSign);
}

exports.generateURL = function (signature, userid, filename, time) {
  var url = config.host + '/files-pub/' + signature + '/' + time.getTime() + '/' + userid + '/' + filename;
  return url;
}