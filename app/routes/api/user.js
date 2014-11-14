/**
 * User Routes
 * Path: /api/user
 */


var express = require('express');
var router = express.Router();

var controller = require('../../controllers/user');

router.route('/')
.get(controller.get);
//.put(controller.put)
//.delete(controller.delete);


module.exports = router;