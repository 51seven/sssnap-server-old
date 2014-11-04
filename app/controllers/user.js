var _ = require('lodash')
  , mongoose = require('mongoose');

var google = require('../helper/google')
  , status = require('../helper/status');

var User = mongoose.model('User');

exports.getUser = function(req, res) {

  var tokenInfo = req.user.token_info;
  var access_token = req.user.access_token;

  google.callAPI('/plus/v1/people/' + tokenInfo.user_id, access_token)
  .then(function(userInfo) {
    var imageUrl = userInfo.image.url;
    userInfo.image.url = imageUrl.substring(0, imageUrl.length - 6);

    return User.createOrUpdate({ imageUrl: userInfo.image.url, email: tokenInfo.email, externalId: tokenInfo.user_id, name: userInfo.displayName, provider: 'google'});
  }).then(function(user) {
    req.user = user.response;
    res.send(req.user);
  }).catch(function(err) {
    next(err);
  });

}