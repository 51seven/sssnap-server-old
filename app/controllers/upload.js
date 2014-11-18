/**
 * Upload controller
 */

var _ = require('lodash')
  , fs = require('fs')
  , path = require('path')
  , config = require('config')
  , Promise = require('bluebird')
  , mkdirp = require('mkdirp')
  , mongoose = require('mongoose')
  , encryptor = require('file-encryptor');
var status = require('../helpers/status');

var Upload = mongoose.model('Upload');
var User = mongoose.model('User');


exports.permission = function(req, res, next, uploadId) {
  var options = {
    findOne: true,
    where: { _id: uploadId },
    populate: ''
  };
  Upload.load(options).then(function(doc) {
    if(!doc) throw null;
    if(doc._user != req.user.id) throw new status.Forbidden('Access denied.');
    else next();
  })
  .catch(function(err) {
    next(err);
  });
}

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
  var file = req.files.file;

  // Bad Request when no file was uploaded
  if(!file) return next(status.BadRequest('No file found.'));

  // Bad Request when wrong mimetype was uploaded
  if(file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
    return next(status.BadRequest('Wrong image mimetype. Only image/png and image/jpeg files are allowed.'));
  }
  var userdir = path.join(__dirname, '../../uploads/'+req.user._id);
  var source = path.join(__dirname, '../../'+file.path);
  var dest = path.join(userdir, req.files.file.name);
  var upload, dest;

  var encryptFile = Promise.promisify(encryptor.encryptFile);
  var mkdir = Promise.promisify(mkdirp);

  // Make userdir, if it doesn't exist
  mkdir(userdir)
  .then(function(dir) {
    // Create new document in upload model
    var newUpload = new Upload({
      _user: req.user._id,
      title: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      destination: dest,
      filename: file.name
    });

    return Upload.create(newUpload);
  })
  .then(function(upl) {
    upload = upl;
    var options = {
      findOne: true,
      where: { _id: upload._user }
    }

    return User.load(options);
  })
  .then(function(user) {
    console.log(user);
    user.uploads.push(upload);
    user.save();
  })
  .then(function(saveduser) {

    // encrypt the temporary file using AES256 and
    // save the encrypted file in the userdir
    return encryptFile(source, dest, config.aes.key, { algorithm: config.aes.algorithm });
  })
  .then(function() {
    res.json(upload.toObject());
  })
  .catch(function(err) {
    next(err);
  });
}

/**
 * list all uploads of an user
 *
 * @returns Array of Upload Objects
 */
exports.list = function(req, res, next) {
  var options = {
    where: { _user: req.user.id },
    limit: req.param('limit'),
    skip: req.param('skip')
  };

  Upload.load(options).then(function(docs) {
    // docs is an array, and every item in this array is a mongooseDocument
    // with the method toObject(). We need this toObject() of every document.
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

  // Don't populate user here
  // or you will suffer from a great pain
  var options = {
    findOne: true,
    where: { _id: req.param('upload_id') }
  };
  Upload.load(options).then(function(doc) {
    if(!doc) throw null;
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
    // If no doc is found, no shortlink exists
    // and so that's a 404. We don't want to throw
    // a error for this, just escape the promise.
    if(!doc) throw null;

    res.render('view', { image: doc.publicUrl })
  })
  .catch(function(err) {
    next(err);
  });
}