var mongoose = require('mongoose')
  , Promise = require('bluebird')
  , config = require('config');

var Schema = mongoose.Schema;

var randString = function (len) {
  var result = '';
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Schema
 */

var UploadSchema = new Schema({
  _userid: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  destination: {
    type: String,
    required: true,
    unique: true
  },
  shortlink: {
    type: String,
    required: true,
    unique: true
  }
});

/**
 * Statics
 */

UploadSchema.statics = {
  create: function(opts, count) {
    var self = this;
    if(!count) count = 1;
    return new Promise(function(resolve, reject) {
      var shortlink = randString(4);
      var newUpload = new Upload({
        _userid: opts.userid,
        title: opts.title,
        mimetype: opts.mimetype,
        size: opts.size,
        destination: opts.destination,
        shortlink: shortlink
      });

      newUpload.save(function(err, doc) {
        if(err) {
          if(err.code === 11000) {
            count++;
            if(count < 6) {
              self.create(opts, count);
            } else {
              reject(err);
            }
          } else {
            reject(err);
          }
        }
        else resolve(doc);
      });
    });
  },

  load: function (options, cb) {
    var query = this.findOne(options.criteria);
    if(options.select) query.select(options.select);
    return new Promise(function(resolve, reject) {
      query.exec(function(err, doc) {
        if(err) reject(err);
        else resolve(doc);
      });
    });
  }
}

/**
 * Virtuals
 */

UploadSchema.virtual('response')
.get(function() {
  return {
    id: this._id,
    userid: this._userid,
    title: this.title,
    shortlink: config.host + '/' + this.shortlink,
    size: this.size,
    mimetype: this.mimetype
  }
});

mongoose.model('Upload', UploadSchema);
var Upload = mongoose.model('Upload');