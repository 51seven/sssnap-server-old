var fs = require('fs')
  , mongoose = require('mongoose')
  , tmp = require('tmp')
  , Promise = require('bluebird')
  , config = require('config')
  , encryptor = require('file-encryptor');

var hmac = require('../helper/hmac')
  , status = require('../helper/status');

var Upload = mongoose.model('Upload');

exports.show = function(req, res, next) {
  var key = req.param('key')
    , timestamp = req.param('timestamp')
    , userid = req.param('userid')
    , filename = req.param('filename');

  var time = new Date(timestamp*1);

  Upload.load({ criteria: { _userid: mongoose.Types.ObjectId(userid), filename: filename }}).then(function(doc) {
    var destination = doc.destination;
    var Signature = hmac.createSignature(destination, userid, filename, time);

    var dateCompare = (new Date) - time;

    if(Signature !== key || (dateCompare > 300000 || dateCompare < -30000)) {
      return next(new status.Forbidden('Access to file invalid or expired.'));
    }

    var decryptFile = Promise.promisify(encryptor.decryptFile);

    tmp.file(function _tempFileCreated(err, path, fd, cleanupCallback) {
      decryptFile(destination, path, config.aes.key, { algorithm: config.aes.algorithm }).then(function() {
        if (err) throw err;
        var img = fs.readFileSync(path);
        res.writeHead(200, {'Content-Type': doc.mimetype });
        res.end(img, 'binary');
        cleanupCallback();
      })
      .catch(function(err) {
        next(err);
      });
    });

  });
}