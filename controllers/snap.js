exports.uploadSnap = function(req, res, next) {
  res.send(req.files);
}