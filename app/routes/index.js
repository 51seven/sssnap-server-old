var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/:shortlink', function(req, res, next) {
  require('../controllers/upload').show(req, res, next)
});

router.get('/files-pub/:key/:timestamp/:userid/:filename', function(req, res, next) {
  require('../controllers/file').show(req, res, next);
});

module.exports = router;
