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

router.get('/:shortid', require('../controllers/upload').show);


module.exports = router;