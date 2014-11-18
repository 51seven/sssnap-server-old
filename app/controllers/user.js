/**
 * User controller
 */

var _ = require('lodash')
  , Promise = require('bluebird')
  , mongoose = require('mongoose');
var google = require('../helpers/google')
  , status = require('../helpers/status');

var User = mongoose.model('User');
var Upload = mongoose.model('Upload');


function getUser(user) {
  return new Promise(function(resolve, reject) {
    if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      resolve(user);
    } else {
      var tokenInfo = user.token_info;
      var access_token = user.access_token;

      google.callAPI('/plus/v1/people/' + tokenInfo.user_id, access_token)
      .then(function(userInfo) {
        if(userInfo.error) {
          reject(status.Forbidden(userInfo.error.message));
        }

        // save image url
        var imageUrl = userInfo.image.url;
        imageUrl = imageUrl.substring(0, imageUrl.length - 6);


        resolve(new User({
          imageUrl: imageUrl,
          email: tokenInfo.email,
          externalId: tokenInfo.user_id,
          name: userInfo.displayName,
          provider: 'google'
        }));
      })
      .catch(function(err) {
        reject(err);
      });
    }
  });
}

/**
 * This login/registration routine does:
 *  * gets informations about the authorized user
 *  * upsert the user doc
 *    * onCreate: save all data
 *    * onUpdate: save just the users profile image
 *  * gets information about the uploads
 *
 * @returns Single User Object
 */
exports.get = function(req, res, next) {
  var populate = {};
  var limit = req.param('limit') || 10;
  var skip = req.param('skip') || 0;
  if(req.param('populate') === 'uploads') populate = { populate: 'uploads' };

  var transform = _.assign({transform: true}, populate, { options: { limit: limit, skip: skip }});

  getUser(req.user).then(function(newUser) {
    return User.createOrUpdate(newUser);
  }).then(function(user) {
    var options = { findOne: true, where: { _id: user._id }};
    if(!_.isEmpty(populate)) {
      options = _.assign(options, { populate: { path: 'uploads' }});
    }

    return User.load(options);
  }).then(function(user) {
    res.json(user.toObject(transform));
  }).catch(function(err) {
    next(err);
  });

}