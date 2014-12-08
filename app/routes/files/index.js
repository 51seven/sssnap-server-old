/**
 * File Routes
 * Path: /files
 */

var express = require('express');
var router = express.Router();

var auth = require('../../controllers/auth');
var controller = require('../../controllers/file');

router.get('/pub/:userid/:filename', controller.publicShow);

router.use('/pri', auth);
router.get('/pri/:userid/:filename', controller.privateShow);


module.exports = router;