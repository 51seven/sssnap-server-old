var fs = require('fs')
  , path = require('path')
  , _ = require('lodash')
  , config = require('config')
  , Promise = require('bluebird')
  , mkdirp = require('mkdirp')
  , encryptor = require('file-encryptor')
  , mongoose = require('mongoose');
var status = require('../helpers/status');

var Upload = mongoose.model('Upload');

/**
 * This upload routine does:
 *  * create a userdir if necessary
 *  * create a new database entry
 *  * encrypt the received file
 *  * save the received file in the userdir
 *
 * @returns Single Upload Object
 *
 * TODO: encryption key per uploaded file
 * TODO: catch -> delete saved file, delete created db entry
 */
exports.post = function(req, res, next) {
  var userdir = path.join(__dirname, '../../uploads/'+req.user.id);
  var source = path.join(__dirname, '../../'+req.files.file.path);
  var dest = path.join(userdir, req.files.file.name);
  var upload;

  var encryptFile = Promise.promisify(encryptor.encryptFile);
  var mkdir = Promise.promisify(mkdirp);

  // Make userdir, if it doesn't exist
  mkdir(userdir)
  .then(function(dir) {
    // Create new document in upload model

    return Upload.create({
      userid: req.user.id,
      title: req.files.file.originalname,
      mimetype: req.files.file.mimetype,
      size: req.files.file.size,
      destination: dest,
      filename: req.files.file.name
    });
  })
  .then(function(upl) {
    upload = upl;

    // encrypt the temporary file using AES256 and
    // save the encrypted file in the userdir
    return encryptFile(source, dest, config.aes.key, { algorithm: config.aes.algorithm });
  })
  .then(function() {
    res.send(upload.response);
  })
  .catch(function(err) {
    next('Unknown error when processing upload.');
  });
}

/**
 * list all uploads of an user
 *
 * @returns Array of Upload Objects
 */
exports.list = function(req, res, next) {
  Upload.loadAll({ criteria: { _userid: req.user.id }, limit: req.param('limit'), skip: req.param('skip')}).then(function(docs) {
    var response = _.map(docs, function(doc) { return doc.response });
    res.send(response);
  })
  .catch(function(err) {
    next(err);
  });
}

/**
 * get informations to a single upload
 *
 * @returns Single Upload Object
 */
exports.get = function(req, res, next) {
  var id = req.param('id');
  Upload.load({ criteria: { _id: id }}).then(function(doc) {
    res.send(doc.response);
  })
  .catch(function(err) {
    next(err);
  });
}

/**
 * render the upload view
 */
exports.show = function(req, res, next) {
  var shortlink = req.param('shortlink');

  // Get upload based on shortlink
  Upload.load({ criteria: { shortlink: shortlink }})
  .then(function(doc) {
    res.render('view', { image: doc.response.info.publicUrl})
  })
  .catch(function(err) {
    next();
  });
}