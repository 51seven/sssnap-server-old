var _ = require('lodash')
  , mongoose = require('mongoose');

var google = require('../helpers/google')
  , status = require('../helpers/status');

var User = mongoose.model('User');
var Upload = mongoose.model('Upload');

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
  var tokenInfo = req.user.token_info;
  var access_token = req.user.access_token;


  google.callAPI('/plus/v1/people/' + tokenInfo.user_id, access_token)
  .then(function(userInfo) {
    if(userInfo.error) {
      throw new status.Forbidden(userInfo.error.message);
    }

    // save image url
    var imageUrl = userInfo.image.url;
    imageUrl = imageUrl.substring(0, imageUrl.length - 6);

    // Create new user, if user doesn't exist
    // If user exists update profile image
    var newUser = {
      imageUrl: imageUrl,
      email: tokenInfo.email,
      externalId: tokenInfo.user_id,
      name: userInfo.displayName,
      provider: 'google'
    };

    return User.createOrUpdate(newUser);
  }).then(function(user) {
    req.user = user.toObject();
    res.json(req.user);
  }).catch(function(err) {
    next(err);
  });

}