/**
 * Routes
 */

var express = require('express');
var router = require('./routes/');

// This is more or less a simple pass-through
// to the express.Routers
module.exports = function(app) {
  app.use('/', router);
};