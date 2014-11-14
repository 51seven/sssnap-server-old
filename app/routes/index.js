/**
 * Main Router
 * Path: /
 */

var express = require('express');
var router = express.Router();

router.use('/api', require('./api'));
router.use('/files', require('./files'));

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/:shortlink', function(req, res, next) {
  require('../controllers/upload').show(req, res, next)
});


module.exports = router;