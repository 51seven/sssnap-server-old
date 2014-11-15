/**
 * API Routes
 * Path: /api
 */

var express = require('express');
var router = express.Router();

var auth = require('../../controllers/auth');
var user = require('./user');
var upload = require('./upload');

// Authorization
// No matter if the route exists, it will
// always first ask for authorization. I'm
// not sure if this is good or bad.
router.use(auth);

// Subroute mapping
router.use('/user', user);
router.use('/upload', upload);


module.exports = router;