/**
 * swaggerDoc builder
 */

var _ = require('lodash');

/**
 * combines JSON Files based on their name
 * @param  {Array} files   File Names
 * @param  {String} dir    Directory Name
 * @return {Object}        combined Object
 */
function combineJSON(files, dir) {
  var obj = {};
  _.each(files, function(file) {
    _.assign(obj, require('./'+dir+'/'+file+'.json'));
  });
  return obj;
}

var resourceFiles = [
  'upload'
];
var definitionFiles = [
  'error',
  'upload'
];

// Combining all JSON Files into a single Object
var swaggerDoc = {};
var swaggerInfo = require('./info.json');
var swaggerResources = combineJSON(resourceFiles, 'resources');
var swaggerDefinitions = combineJSON(definitionFiles, 'definitions');

swaggerDoc = swaggerInfo;
swaggerDoc["paths"] = swaggerResources;
swaggerDoc["definitions"] = swaggerDefinitions;


module.exports = swaggerDoc;