exports.getUser = function(req, res) {
  res.send(req.user);
}