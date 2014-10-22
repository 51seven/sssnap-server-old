/**
 * Starting point of the express app
 */

var express = require('express');

var middleware = require('./app/middleware')
  , router = require('./app/router')
  , errorHandler = require('./app/error-handler');

var app = express();

// Mount the middleware to the express
// app, e.g. the body parser, logger,
// view engines, ...
middleware(app);

// The router contains
//  - all the server URL routes
//  - the swagger API routes
router(app);

// If something is passed through the
// router, an error occured and will
// be handled here.
errorHandler(app);

// After the errorHandler everything
// is processed.

module.exports = app;

// The app will be passed to bin/www
// where the server will be started.