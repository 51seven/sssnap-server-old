/**
 * API Routes
 * Path: /api
 */

var express = require('express');
var router = express.Router();

var auth = require('../../controllers/auth');
var user = require('./user');
var upload = require('./upload');

// Authentication
router.use(auth);

// Subroute mapping
router.use('/user', user);
router.use('/upload', upload);


module.exports = router;