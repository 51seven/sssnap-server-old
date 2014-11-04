/**
 * Middleware mounted to the express app
 */

var express = require('express')
  , fs = require('fs')
  , path = require('path')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , multer = require('multer')
  , cors = require('cors')
  , _ = require('lodash')
  , mongoose = require('mongoose')
  , swagger = require('swagspress')
  , config = require('config')
  , autoReap = require('multer-autoreap');;

module.exports = function(app) {

  // Connect to mongodb
  var connect = function () {
    var options = { server: { socketOptions: { keepAlive: 1 } } };
    mongoose.connect(config.db, options);
  };
  connect();

  mongoose.connection.on('error', console.log);
  //mongoose.connection.on('disconnected', connect);

  // Bootstrap models
  fs.readdirSync(__dirname + '/models').forEach(function (file) {
    if (~file.indexOf('.js')) require(__dirname + '/models/' + file);
  });

  app.use(cors());
  // view engine setup
  app.set('views', path.join(__dirname, './views'));
  app.set('view engine', 'jade');

  // uncomment after placing your favicon in /public
  //app.use(favicon(__dirname + '/public/favicon.ico'));
  app.use(logger('dev'));

  // multer only parses multipart/form-data
  // stores incoming files in /uploads/temp
  // controllers do have to delete these temporary files
  app.use(multer({ dest: './uploads/temp'}));

  // Delete file when request is done
  app.use(autoReap);

  // bodyParser parses application/*
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  // path for static files
  app.use(express.static(path.join(__dirname, './public')));

  // override HTTP Verbs, such as PUT and DELETE
  app.use(methodOverride());

  app.use(swagger({
    doc: path.join(__dirname, 'api/swagger.js'),
    controller: path.join(__dirname, 'controllers'),
    auth: path.join(__dirname, 'api/auth')
  }));

};