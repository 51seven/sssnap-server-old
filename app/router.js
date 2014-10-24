/**
 * Routes
 */

var express = require('express');

var index = require('./routes/index')
  , swagger = require('./api');

var api = express();

module.exports = function(app) {
  app.use('/', index);

  swagger(app);
};