/**
 * Middleware mounted to the express app
 */

var express = require('express')
  , path = require('path')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , multer = require('multer')
  , cors = require('cors')
  , _ = require('lodash');

module.exports = function(app) {

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

  // bodyParser parses application/*
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  // path for static files
  app.use(express.static(path.join(__dirname, './public')));

  // override HTTP Verbs, such as PUT and DELETE
  app.use(methodOverride());

};