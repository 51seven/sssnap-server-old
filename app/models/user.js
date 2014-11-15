var mongoose = require('mongoose')
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
  }
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
          self.findOneAndUpdate({ _id: mongoose.Types.ObjectId(doc._id) }, { imageUrl: opts.imageUrl }, function(err, doc) {
            if(err) reject(err);
            else resolve(doc);
          });
        }

        // new user = save all data
        else {
          var newUser = new User({
            name: opts.name,
            email: opts.email,
            provider: opts.provider,
            externalId: opts.externalId,
            imageUrl: opts.imageUrl
          });

          newUser.save(function(err, doc) {
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
    if(options.select) {
      query.select(options.select)
    }

    return new Promise(function(resolve, reject) {
      query.exec(function(err, doc) {
        if(err) reject(err);
        else resolve(doc);
      });
    });
  },
}

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
    }
  }
}


mongoose.model('User', UserSchema);
var User = mongoose.model('User');