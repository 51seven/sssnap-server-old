/**
 * Upload Routes
 * Path: /api/upload
 */


var express = require('express');
var router = express.Router();

var controller = require('../../controllers/upload');

router.param('upload_id', controller.permission);


router.route('/')
.get(controller.list)
.post(controller.post);


router.route('/:upload_id')
.get(controller.get);
//.put(controller.put)
//.delete(controller.delete);


module.exports = router;