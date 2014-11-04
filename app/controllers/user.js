var _ = require('lodash')
  , mongoose = require('mongoose');

var google = require('../helper/google')
  , status = require('../helper/status');

var User = mongoose.model('User');

exports.getUser = function(req, res, next) {

  var tokenInfo = req.user.token_info;
  var access_token = req.user.access_token;


  google.callAPI('/plus/v1/people/' + tokenInfo.user_id, access_token)
  .then(function(userInfo) {
    if(userInfo.error) {
      throw new status.Forbidden(userInfo.error.message);
    }

    var imageUrl = userInfo.image.url;
    imageUrl = imageUrl.substring(0, imageUrl.length - 6);

    return User.createOrUpdate({ imageUrl: imageUrl, email: tokenInfo.email, externalId: tokenInfo.user_id, name: userInfo.displayName, provider: 'google'});
  }).then(function(user) {
    req.user = user.response;
    res.send(req.user);
  }).catch(function(err) {
    next(err);
  });

}