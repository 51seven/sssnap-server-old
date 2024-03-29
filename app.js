/**
 * Starting point of the express app
 */

var express = require('express')
  , sio = require('socket.io')()
  , mongoose = require('mongoose')
  , fs = require('fs')
  , config = require('config');


/**
 * Initialize Database
 */

// Open connection to mongodb
var connect = function () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  mongoose.connect(config.db, options);
};

connect();
mongoose.connection.on('error', console.log);
// This can be good for production
// mongoose.connection.on('disconnected', connect);

// Bootstrap models
fs.readdirSync('./app/models').forEach(function (file) {
  if (~file.indexOf('.js')) require('./app/models/' + file);

  // Database needs to be clean when testing
  if(process.env.NODE_ENV === 'test') {
    mongoose.model(file.charAt(0).toUpperCase() + file.substring(1, file.length - 3)).remove({}, function(err) {
      if(err) console.log(err);
    });
  }
});


/**
 * Initialize App
 */

var app = express();


// Mount the middleware to the express
// app, e.g. the body parser, logger,
// view engines, ...
require('./app/middleware')(app, sio);

// All requests will be passed to the
// router and `function(req, res)` will
// do its thing.
require('./app/router')(app);

// If something is passed through the
// router, an error occured and will
// be handled here.
require('./app/error-handler')(app);

// After the errorHandler everything
// is processed. */

module.exports.express = app;
module.exports.sio = sio;

// The app will be passed to bin/www
// where the server will be started.