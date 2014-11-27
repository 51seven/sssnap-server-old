/**
 * User controller
 */

var _ = require('lodash')
  , Promise = require('bluebird')
  , mongoose = require('mongoose');
var google = require('../helpers/google')
  , status = require('../helpers/status')
  , resobj = require('../helpers/res-object');

var User = mongoose.model('User');

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
          reject(status.Forbidden('Google API Error', userInfo.error.message));
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
  var limit = req.param('limit') || 10;
  var skip = req.param('skip') || 0;

  getUser(req.user).then(function(newUser) {
    return User.createOrUpdate(newUser);
  }).then(function(user) {
    var options = [
      {
        model: 'User',
        key: 'user',
        options: {
          findOne: true,
          where: { _id: user._id },
          populate: 'uploads'
        }
      },
      {
        model: 'Upload',
        key: 'uploads',
        options: {
          where: { _user: user._id },
          skip: skip,
          limit: limit,
          populate: '_user'
        }
      }
    ]
    return resobj(options, req);
  }).then(function(obj) {
    res.json(obj);
  }).catch(function(err) {
    next(err);
  });

}