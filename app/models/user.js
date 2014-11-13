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

UserSchema.virtual('response')
.get(function() {
  var counter = this.counter;
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    image: this.imageUrl,
    info: {
      count: 0,
      used: 0
    },
    oauth: {
      provider: this.provider,
      id: this.externalId
    }
  }
});


mongoose.model('User', UserSchema);
var User = mongoose.model('User');