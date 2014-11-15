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
    res.send(upload.toObject());
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
  var options = {
    where: { _userid: req.user.id },
    limit: req.param('limit'),
    skip: req.param('skip')
  };

  Upload.load(options).then(function(docs) {
    var toObjectDocs = _.map(docs, function(doc) { return doc.toObject(); });
    res.json(toObjectDocs);
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
  var options = {
    findOne: true,
    where: { _id: req.param('upload_id') }
  };
  Upload.load(options).then(function(doc) {
    res.json(doc.toObject());
  })
  .catch(function(err) {
    next(err);
  });
}

/**
 * render the upload view
 */
exports.show = function(req, res, next) {
  var options = {
    findOne: true,
    where: { shortlink: req.param('shortlink') }
  };

  Upload.load(options)
  .then(function(doc) {
    if(!doc) throw new Error('not found');
    res.render('view', { image: doc.publicUrl })
  })
  .catch(function(err) {
    if(err.message === 'not found') next();
    else next(err);
  });
}