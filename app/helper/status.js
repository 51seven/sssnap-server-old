/**
 * Forbidden Error
 * @param {message} message Message to pass to error
 * @return {Error}  Error Object with status 403
 */
exports.Forbidden = function(message) {
  var err = new Error(message);
  err.status = 403;
  return err;
}