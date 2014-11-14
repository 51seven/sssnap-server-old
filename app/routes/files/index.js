/**
 * File Routes
 * Path: /files
 */

var express = require('express');
var router = express.Router();

router.get('/pub/:key/:timestamp/:userid/:filename', require('../../controllers/file').show);


module.exports = router;