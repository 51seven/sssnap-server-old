var mkdirp = require('mkdirp')
  , path = require('path')
  , Promise = require('bluebird')
  , fs = require('fs')
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

  p_mkdirp(userdir)
  .then(function(dir) {
    return Upload.create({
      userid: req.user.id,
      title: req.files.file.originalname,
      mimetype: req.files.file.mimetype,
      size: req.files.file.size,
      destination: dest
    });
  })
  .then(function(upl) {
    upload = upl;
    return p_copyFile(source, dest);
  })
  .then(function(tar) {
    res.send(upload.response);
  });
}