/**
 * Upload model
 */

var mongoose = require('mongoose')
  , Promise = require('bluebird')
  , config = require('config');
var hmac = require('../helpers/hmac')

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
  _user: {
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
  shortid: {
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
  create: function(newUpload, count) {
    var self = this;
    if(!count) count = 1;
    return new Promise(function(resolve, reject) {
      newUpload.shortid = randString(4);

      // TODO: Test this error 11000 fallback
      newUpload.save(function(err, doc) {
        if(err) {
          if(err.code === 11000) {
            count++;
            if(count < 6) {
              self.create(newUpload, count);
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
      if(options.sort) query.sort(options.sort);
    }
    if(options.select) query.select(options.select);
    if(options.populate) query.populate(options.populate);

    return new Promise(function(resolve, reject) {
      query.exec().then(function(doc) {
        resolve(doc);
      }, function(err) {
        reject(err);
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

UploadSchema.virtual('_userid')
.get(function() {
  return this._user._id;
});

UploadSchema.virtual('publicUrl')
.get(function() {
  return this.generatePublicURL(this.destination, this._userid, this.filename);
});

UploadSchema.virtual('shortlink')
.get(function() {
  return config.host + this.shortid;
})



/**
 * Options
 */

if(!UploadSchema.options.toObject) UploadSchema.options.toObject = {};
UploadSchema.options.toObject.transform = function (doc, ret, options) {
  return {
    id: ret._id,
    userid: doc._userid,
    title: ret.title,
    shortlink: doc.shortlink,
    views: ret.views,
    created: ret.created,
    publicUrl: doc.publicUrl,
    size: ret.size,
    mimetype: ret.mimetype
  }
}

mongoose.model('Upload', UploadSchema);
var Upload = mongoose.model('Upload');