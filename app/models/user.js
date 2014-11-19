/**
 * User model
 */

var mongoose = require('mongoose')
  , _ = require('lodash')
  , Promise = require('bluebird');

var Upload = mongoose.model('Upload');
var Schema = mongoose.Schema;

/**
 * Schema
 */

var UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  provider: {
    type: String,
    enum: ['google'],
    required: true
  },
  externalId: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  totalSpace: {
    type: Number,
    default: 10000000000
  },
  uploads: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Upload'
    }
  ]
});

/**
 * Statics
 */

UserSchema.statics = {
  /**
   * create a new user
   * rejecting is possibly a not-unique email address or a db error
   *
   * @param {Object} opts { name, email, provider, id }
   * @return {Promise}
   */
  createOrUpdate: function(opts) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.findOne({ provider: opts.provider, externalId: opts.externalId }, function(err, doc) {
        if(err) reject(err);

        // user exists = update image
        else if(doc) {
          var query = self.findOneAndUpdate({ _id: doc._id }, { imageUrl: opts.imageUrl });
          query.exec(function(err, doc) {
            if(err) reject(err);
            else resolve(doc);
          });
        }

        // new user = save all data
        else {
          opts.save(function(err, doc) {
            if(err) reject(err);
            else resolve(doc);
          })
        }
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
    if(options.select) query.select(options.select);
    if(options.populate) query.populate(options.populate);

    return new Promise(function(resolve, reject) {
      query.exec(function(err, doc) {
        if(err) reject(err);
        else resolve(doc);
      });
    });
  },
}

/**
 * Virtuals
 */

UserSchema.virtual('uploadCount')
.get(function() {
  return this.uploads.length;
});

UserSchema.virtual('usedSpace')
.get(function() {
  var space = 0;
  _.forEach(this.uploads, function(upload) { space += upload.size });
  return space;
});

/**
 * Options
 */

if(!UserSchema.options.toObject) UserSchema.options.toObject = {};
UserSchema.options.toObject.transform = function (doc, ret, options) {
  return {
    id: ret._id,
    name: ret.name,
    email: ret.email,
    image: ret.imageUrl,
    oauth: {
      provider: ret.provider,
      id: ret.externalId
    },
    quota: {
      used: doc.usedSpace,
      total: ret.totalSpace,
      count: doc.uploadCount
    }
  }
}


mongoose.model('User', UserSchema);
var User = mongoose.model('User');