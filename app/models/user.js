var mongoose = require('mongoose')
  , Promise = require('bluebird');

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
  }
});

/**
 * Methods
 */

UserSchema.statics = {
  /**
   * check existence of user
   * rejecting is possibly a db error
   *
   * @param {Object} opts { id, provider }
   * @return {Promise}
   */
  checkExistence: function(opts) {
    var query = this.findOne({ 'externalId': opts.id, 'provider': opts.provider });
    return new Promise(function(resolve, reject) {
      query.exec(function(err, doc) {
        if(err) reject(err);
        else resolve(doc);
      });
    });
  },

  /**
   * create a new user
   * rejecting is possibly a mail address, which is already in the db
   *
   * @param {Object} opts { name, email, provider, id }
   * @return {Promise}
   */
  create: function(opts) {
    var newUser = new User({
      name: opts.name,
      email: opts.email,
      provider: opts.provider,
      externalId: opts.id
    });
    return new Promise(function(resolve, reject) {
      newUser.save(function(err, user) {
        if(err) reject(err);
        else resolve(user);
      });
    });
  }
}

mongoose.model('User', UserSchema);
var User = mongoose.model('User');