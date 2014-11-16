/**
 * Authorization provider switch
 */

var mongoose = require('mongoose');
var status = require('../../helpers/status');

var User = mongoose.model('User');

module.exports = function(req, res, next) {
  var provider = req.get('x-auth-provider') || req.query.provider;

  if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    var testuser = new User({
      name: "John Doe",
      email: "johndoe@gmail.com",
      provider: "google",
      externalId: 113540964082774764753,
      imageUrl: "https://lh4.googleusercontent.com/-xUelHR_l_mk/AAAAAAAAAAI/AAAAAAAACS4/zvs8v_wLjyo/photo.jpg"
    });
    User.createOrUpdate(testuser).then(function(user) {
      req.user = user;
      return next();
    });
  }

  else {

    switch(provider) {
      case 'google':
        return require('./' + provider)(req, res, next);
        break;
      default:
        return next(status.Forbidden('No authentication provider found. You have to add the name of your provider in the HTTP header or in the URL path.'))
    }

  }
}