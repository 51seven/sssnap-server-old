exports.newUpload = function(req, res, next) {
  res.send(req.files);
}