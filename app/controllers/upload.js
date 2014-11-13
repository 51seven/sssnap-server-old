var mkdirp = require('mkdirp')
  , path = require('path')
  , status = require('../helper/status')
  , Promise = require('bluebird')
  , fs = require('fs')
  , encryptor = require('file-encryptor')
  , config = require('config')
  , mongoose = require('mongoose');

var Upload = mongoose.model('Upload');

function p_mkdirp(dir) {
  return new Promise(function(resolve, reject) {
    mkdirp(dir, function(err) {
      if(err) reject(err);
      else resolve(dir);
    });
  });
}

// from http://stackoverflow.com/a/21995878/2376069
function p_copyFile(source, target) {
  return new Promise(function(resolve, reject) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", done);

    var wr = fs.createWriteStream(target);
    wr.on("error", done);
    wr.on("close", function(ex) {
      done();
    });
    rd.pipe(wr);

    function done(err) {
      if(!cbCalled) {
        if(err) reject(err);
        else resolve(target);
        cbCalled = true;
      }
    }
  });
}

exports.newUpload = function(req, res, next) {
  var userdir = path.join(__dirname, '../../uploads/'+req.user.id);
  var source = path.join(__dirname, '../../'+req.files.file.path);
  var dest = path.join(userdir, req.files.file.name);
  var upload;

  var encryptFile = Promise.promisify(encryptor.encryptFile);

  // Make userdir, if it doesn't exist
  p_mkdirp(userdir)
  .then(function(dir) {
    // Create new document in upload model
    //
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