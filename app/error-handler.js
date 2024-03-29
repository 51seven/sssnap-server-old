/**
 * Error handling module
 */

module.exports = function(app) {
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  /* istanbul ignore if */
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      if(req.accepts('text/html')) {
        res.render('error', {
          message: err.message,
          error: err
        });
      }
      else {
        res.send({
          status: err.status,
          message: err.message,
          info: err.info,
          stack: err
        });
      }
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    if(req.accepts('text/html')) {
      res.render('error', {
        message: err.message,
        error: {}
      });
    }
    else {
      res.send({
        status: err.status,
        message: err.message,
        info: err.info
      });
    }
  });
};