/**
 * Authorization provider switch
 */

var mongoose = require('mongoose');
var status = require('../../helpers/status');

var User = mongoose.model('User');

module.exports = function(req, res, next) {
  var provider = req.get('x-auth-provider') || req.query.provider;

  /* istanbul ignore else  */
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

  // I don't know how to test the authentication process
  else {

    switch(provider) {
      case 'google':
        return require('./' + provider)(req, res, next);
        break;
      default:
        return next(status.Forbidden('No authentication provider', 'You have to send the name of your provider in the HTTP header \'x-auth-provider\' or in the URL query as \'provider\'. Valid values are: google'));
    }

  }
}