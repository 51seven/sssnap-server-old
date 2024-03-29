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
var status = require('../helpers/status')
  , resobj = require('../helpers/res-object');

var Upload = mongoose.model('Upload');
var User = mongoose.model('User');


exports.permission = function(req, res, next, uploadId) {
  var options = {
    findOne: true,
    where: { _id: uploadId }
  };
  Upload.load(options).then(function(doc) {
    if(!doc) throw null;
    if(doc._user != req.user.id) throw new status.Forbidden('Access denied', 'You have no permissions to perform this action.');
    else next();
  })
  .catch(function(err) {
    return next(null);
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
  if(!file) return next(status.BadRequest('File not found', 'Use \'file\' as the key in your multipart/form-data request.'));

  // Bad Request when wrong mimetype was uploaded
  if(file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
    return next(status.BadRequest('Invalid file mimetype', 'Only image/png and image/jpeg files are allowed.'));
  }
  var userdir = path.join(__dirname, '../../uploads/'+req.user._id);
  var source = path.join(__dirname, '../../'+file.path);
  var dest = path.join(userdir, req.files.file.name);
  var upload, response;

  var encryptFile = Promise.promisify(encryptor.encryptFile);
  var mkdir = Promise.promisify(mkdirp);

  mkdir(userdir) // Make userdir, if it doesn't exist
  .then(function(dir) { // Create new document in upload model
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
  .then(function(upl) { // Find user doc ...
    upload = upl;

    var options = {
      findOne: true,
      where: { _id: req.user._id },
    };
    return User.load(options);
  })
  .then(function(user) { // ... and add the upload to it
    user.uploads.push(upload);
    user.save();
  })
  .then(function() { // Build response object
    var options = [
      {
        model: 'Upload',
        key: null,
        options: {
          findOne: true,
          where: { _id: upload._id },
          populate: '_user'
        }
      },
      {
        model: 'User',
        key: 'user',
        options: {
          findOne: true,
          where: { _id: upload._user },
          populate: 'uploads'
        }
      }
    ];
    return resobj(options, req);
  })
  .then(function(resobj) {
    response = resobj;
    // encrypt the temporary file using AES256 and
    // save the encrypted file in the userdir
    return encryptFile(source, dest, config.aes.key, { algorithm: config.aes.algorithm });
  })
  .then(function() {
    res.status(201).json(response);
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
  var limit = req.param('limit') || 10;
  var skip = req.param('skip') || 0;

  var options = [
    {
      model: 'User',
      key: 'user',
      options: {
        findOne: true,
        where: { _id: req.user.id },
        populate: 'uploads'
      }
    },
    {
      model: 'Upload',
      key: 'uploads',
      options: {
        where: { _user: req.user.id },
        skip: skip,
        limit: limit,
        populate: '_user',
        sort: '-created'
      }
    }
  ];

  resobj(options, req).then(function(response) {
    res.json(response);
  }).catch(function(err) {
    /* istanbul ignore next */
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
    if(!doc) return next();

    var output = [
      {
        model: 'Upload', key: null,
        options: {
          findOne: true,
          where: { _id: req.param('upload_id') },
          populate: '_user'
        }
      },
      {
        model: 'User', key: 'user',
        options: {
          findOne: true,
          where: { _id: doc._user },
          populate: 'uploads'
        }
      }
    ];

    resobj(output, req).then(function(response) {
      res.json(response);
    });
  })
  .catch(function(err) {
    return next();
  });
}

/**
 * render the upload view
 */
exports.show = function(req, res, next) {
  var shortid = req.param('shortid');
  var options = {
    findOne: true,
    where: { shortid: shortid },
    populate: '_user'
  };

  var views;

  Upload.load(options)
  .then(function(doc) {
    // If no doc is found, no shortlink exists
    // and so that's a 404. We don't want to throw
    // a error for this, just escape the promise.
    if(!doc) throw null;

    // Set cookie if there is none
    // and increment viewcounter.

    /* istanbul ignore if */
    if(req.signedCookies.s_uplCvis !== '1') {                                                     // 10 years in ms
      res.cookie('s_uplCvis', '1', { path: req.path, signed: true, expires: new Date(Date.now() + 315569259747)});
      views = doc.views + 1;


      doc.update({ $inc: { views: 1 }}).exec(function(err, success) {
        // Don't catch the error.
        // Updating and emitting the viewcounter is less important than
        // showing the actual upload.

        // When the doc was updated, emit the new viewcounter
        // to the room with the shortid from the URL
        if(success)
          req.io.sockets.emit(shortid, { views: doc.views + 1});
      });
    } else {
      views = doc.views;
    }

    // This is rendered before the viewcounter in the database will be incremented.
    // The views variable will be incremented although the database entry is not saved.
    res.render('view', { image: doc.publicUrl, views: views });
  })
  .catch(function(err) {
    next(err);
  });
}