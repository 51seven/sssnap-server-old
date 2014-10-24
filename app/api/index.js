/**
 * swagger API
 */

var _ = require('lodash')
  , swaggerTools = require('swagger-tools')
  , swaggerMetadata = swaggerTools.middleware.v2.swaggerMetadata
  , swaggerRouter = swaggerTools.middleware.v2.swaggerRouter
  , swaggerUi = swaggerTools.middleware.v2.swaggerUi
  , swaggerValidator = swaggerTools.middleware.v2.swaggerValidator
  , apiAuhtorization = require('./auth');


var options = {
  controllers: './app/controllers',
  useStubs: process.env.NODE_ENV === 'development' ? true : false
};

module.exports = function(app) {
  // Builded Swagger document
  var swaggerDoc = require('./swagger');

  // Validate the Swagger document
  var result = swaggerTools.specs.v2.validate(swaggerDoc);

  // Handle validation errors and warnings
  /* istanbul ignore if */
  if (typeof result !== 'undefined') {
    if (result.errors.length > 0) {
      console.log('The server could not start due to invalid Swagger document...');

      console.log('');

      console.log('Errors');
      console.log('------');

      result.errors.forEach(function (err) {
        console.log('#/' + err.path.join('/') + ': ' + err.message);
      });

      console.log('');
    }

    if (result.warnings.length > 0) {
      console.log('Warnings');
      console.log('--------');

      result.warnings.forEach(function (warn) {
        console.log('#/' + warn.path.join('/') + ': ' + warn.message);
      });
    }

    if (result.errors.length > 0) {
      process.exit(1);
    }
  }

  // Authorization of incoming requests
  app.use(apiAuhtorization);

  // extend req.body with req.files
  // because swagger-tools don't read req.files
  app.use(function(req, res, next) {
    _.assign(req.body, req.files);
    next();
  });

  // Interpret Swagger resources and attach metadata to request
  app.use(swaggerMetadata(swaggerDoc));

  // Validate Swagger requests
  app.use(swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(swaggerUi(swaggerDoc));

}