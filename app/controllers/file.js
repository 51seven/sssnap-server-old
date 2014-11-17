/**
 * File Serving Controller
 */

var fs = require('fs')
  , tmp = require('tmp')
  , config = require('config')
  , mongoose = require('mongoose')
  , Promise = require('bluebird')
  , encryptor = require('file-encryptor');
var hmac = require('../helpers/hmac')
  , status = require('../helpers/status');

var Upload = mongoose.model('Upload');

function decrypt(destination) {
  var decryptFile = Promise.promisify(encryptor.decryptFile);

  // Create temporary file
  return new Promise(function(resolve, reject) {
    tmp.file(function _tempFileCreated(err, path, fd, cleanupCallback) {
      // decrypt file into temporary file
      decryptFile(destination, path, config.aes.key, { algorithm: config.aes.algorithm }).then(function() {
        if (err) throw err;
        var img = fs.readFileSync(path);
        resolve(img);
      })
      .catch(function(err) {

        // Delete tmp file if anything went wrong
        cleanupCallback();
        reject(err);
      });
    });
  });
}

exports.publicShow = function(req, res, next) {
  var key = req.param('key')
    , timestamp = req.param('timestamp')
    , userid = req.param('userid')
    , filename = req.param('filename');
  var time = new Date(timestamp*1);

  var options = {
    findOne: true,
    where: { _userid: userid, filename: filename }
  };
  Upload.load(options).then(function(doc) {
    var destination = doc.destination;
    var Signature = hmac.createSignature(destination, userid, filename, time);
    var dateCompare = (new Date) - time;

    // Check if Signature is valid
    // or if Signature is expired
    if(Signature !== key || (dateCompare > 300000 || dateCompare < -30000)) {
      return next(new status.Forbidden('Access to file invalid or expired.'));
    }

    if(!doc) return next();

    decrypt(destination).then(function(img) {
      res.writeHead(200, { 'Content-Type': doc.mimetype });
      res.end(img, 'binary');
    })
    .catch(function(err) {
      next(err);
    });
  });
}

exports.privateShow = function(req, res, next) {
  var userid = req.param('userid')
    , filename = req.param('filename');

  var options = {
    findOne: true,
    where: { _userid: userid, filename: filename }
  };
  Upload.load(options).then(function(doc) {
    if(!doc) return next();
    var destination = doc.destination;

    decrypt(destination).then(function(img) {
      res.writeHead(200, { 'Content-Type': doc.mimetype });
      res.end(img, 'binary');
    })
    .catch(function(err) {
      next(err);
    });
  });
}