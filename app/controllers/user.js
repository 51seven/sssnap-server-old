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
    return User.createOrUpdate({ imageUrl: imageUrl, email: tokenInfo.email, externalId: tokenInfo.user_id, name: userInfo.displayName, provider: 'google'});
  }).then(function(user) {
    req.user = user.response;

    // Get all uploads
    return Upload.loadAll({ criteria: { _userid: user._id }, select: 'size'});
  }).then(function(doc) {

    // Sum sizes and count the result
    var sum = 0;
    _(doc).forEach(function(num) {
      sum += (num.size * 1);
    });

    // Fill in the zeros
    // TODO: would be better if upload.response could handle this stuff
    req.user.info.count = doc.length;
    req.user.info.used = sum;
    res.send(req.user);
  }).catch(function(err) {
    next(err);
  });

}