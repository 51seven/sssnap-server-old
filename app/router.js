/**
 * Routes
 */

var express = require('express');

var index = require('./routes/index');

module.exports = function(app) {
  app.use('/', index);
};