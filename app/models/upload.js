var mongoose = require('mongoose')
  , Promise = require('bluebird')
  , hmac = require('../helpers/hmac')
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
  filename: {
    type: String,
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
  },
  views: {
    type: Number,
    default: 0
  },
  created: {
    type: Date,
    default: Date.now
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
        shortlink: shortlink,
        filename: opts.filename
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

  load: function (options) {
    var query;

    if(options.findOne) {
      query = this.findOne(options.where);
    } else {
      query = this.find(options.where);
      query.skip(options.skip);
      query.limit(options.limit);
    }
    if(options.select) {
      query.select(options.select)
    }

    return new Promise(function(resolve, reject) {
      query.exec(function(err, doc) {
        if(err) reject(err);
        else resolve(doc);
      });
    });
  }
}



/**
 * Methods
 */

UploadSchema.methods = {
  generatePublicURL: function(destination, userid, filename) {
    var time = new Date();
    var signature = hmac.createSignature(destination, userid, filename, time);
    var url = hmac.generateURL(signature, userid, filename, time);
    return url;
  }
}



/**
 * Virtuals
 */

UploadSchema.virtual('publicUrl')
.get(function() {
  return this.generatePublicURL(this.destination, this._userid, this.filename);
});



/**
 * Options
 */

if(!UploadSchema.options.toObject) UploadSchema.options.toObject = {};
UploadSchema.options.toObject.transform = function (doc, ret, options) {
  return {
    id: ret._id,
    userid: ret._userid,
    title: ret.title,
    shortlink: config.host + '/' + ret.shortlink,
    views: ret.views,
    created: ret.created,
    info: {
      publicUrl: doc.publicUrl,
      size: ret.size,
      mimetype: ret.mimetye
    }
  }
}

mongoose.model('Upload', UploadSchema);
var Upload = mongoose.model('Upload');