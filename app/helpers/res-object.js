/**
 * Response Object Builder
 */

var _ = require('lodash')
  , Promise = require('bluebird')
  , mongoose = require('mongoose')
  , async = require('async')
  , objectPath = require('object-path');


var models = {};
models.User = mongoose.model('User');
models.Upload = mongoose.model('Upload');

/**
 * Struct:
 * [
 *   {
 *     model: 'User',
 *     key: null
 *   },
 *   {
 *     model: 'Upload',
 *     key: 'upload',
 *     options: (Model Options)
 *   }
 * ]
 */

module.exports = function(struct, req) {
  var build = {};
  var exclude = req.param('exclude') || undefined;
  var include = req.param('include') || undefined;
  var select = req.param('select');

  if(select) {
    exclude = 'all';
    include = select;
  }

  if(exclude) exclude = exclude.split(',');
  if(include) include = include.split(',');

  return new Promise(function(resolve, reject) {
    // async series loop through given structure
    // will struct the result like it is given
    async.eachSeries(struct, function(part, callback) {
      models[part.model].load(part.options).then(function(doc) {
        if(part.key) {
          if(!part.options.findOne)
            build[part.key] = _.map(doc, function(d) { return d.toObject(); });
          else
            build[part.key] = doc.toObject();
        }
        else {
          if(!part.options.findOne)
            build = _.map(doc, function(d) { return d.toObject(); });
          else
            build = doc.toObject();
        }
        callback();
      })
      .catch(function(err) {
        callback(err);
      });
    }, function(err) {
      if(err) reject(err);
      else {
        var tmpsave = JSON.parse(JSON.stringify(build));
        var toInc, arrayCheck, newPath, firstPath;

        // Delete excluded
        _.forEach(exclude, function(ex) {
          if(ex === 'all') build = {};
          else {
            // creating paths for array
            firstPath = ex.split('.')[0];
            inArrPath = ex.split('.');
            inArrPath.shift();
            inArrPath = inArrPath.join('.');

            // Check if item to delete exists
            if(objectPath.has(build, ex) || objectPath.has(build[firstPath][0], inArrPath)) {
              arrayCheck = objectPath.get(build, firstPath);
              // Check if item to delete is in an array
              if(_.isArray(arrayCheck) && ex.split('.')[1]) {

                // Delete all the items from the array
                arrayCheck.forEach(function(e, i) {
                  objectPath.del(build[firstPath][i], inArrPath);
                });
              }
              else {
                // Normal delete
                objectPath.del(build, ex);
              }
            }
          }
        });

        // Re-insert include
        _.forEach(include, function(inc) {
          // creating paths for array
          firstPath = inc.split('.')[0];
          inArrPath = inc.split('.');
          inArrPath.shift();
          inArrPath = inArrPath.join('.');


          // Check if path exists
          if(objectPath.has(tmpsave, inc) || objectPath.has(tmpsave[firstPath][0], inArrPath)) {

            arrayCheck = objectPath.get(tmpsave, firstPath);
            toInc = objectPath.get(tmpsave, inc);

            // Check if item is in array
            if(_.isArray(arrayCheck) && inc.split('.')[1]) {

              // Insert new include in every item of array
              arrayCheck.forEach(function(e, i) {
                toInc = objectPath.get(tmpsave[firstPath][i], inArrPath);
                if(!build[firstPath]) build[firstPath] = [];
                if(!build[firstPath][i]) build[firstPath][i] = {};
                objectPath.set(build[firstPath][i], inArrPath, toInc);
              });
            }
            else {

              // Normal insert
              toInc = objectPath.get(tmpsave, inc);
              objectPath.set(build, inc, toInc);
            }
          }
        });

        resolve(build);
      }
    });
  });

}