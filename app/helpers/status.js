/**
 * Error with statuscode helper
 */


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

/**
 * Bad Request Error
 * @param {message} message Message to pass to error
 * @return {Error}  Error Object with status 400
 */
exports.BadRequest = function(message) {
  var err = new Error(message);
  err.status = 400;
  return err;
}