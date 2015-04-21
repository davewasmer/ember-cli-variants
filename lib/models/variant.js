'use strict';

var crypto     = require('crypto');
var fs         = require('fs-extra');
var CoreObject = require('core-object');
var debug      = require('debug')('ember-cli-variants:variant');

/**
  Variant model is responsible for managing feature flags, variant hashing,
  and static methods provide discovery methods.
*/
function Variant(options) {
  this.name = options.name;
  this.features = options.features;
}
Variant.__proto__ = CoreObject;
Variant.prototype.constructor = Variant;

Variant.prototype.hashName = function() {
  var features = this.features();
  var featureNames = Object.keys(features);
  var featureList = featureNames.reduce(function(list, featureName) {
    return list + '|' + featureName + ':' + features[featureName];
  });
  var featureHash = crypto.createHash('sha1');
  featureHash.update(featureList);
  return shasum.digest('md5');
}

Variant.prototype.features = function() {

}

Variant.discoverVariants = function(selectorPattern, variants) {
  var includeAllVariants = selectorPattern.indexOf('*') > -1;
  Object.keys(variants)
  .filter(function(variantName) {
    return includeAllVariants || selectorPattern.indexOf(variantName) > -1;
  }).map(function(variantName) {
    return {
      name: variantName,
      flags: variants[variantName]
    };
  });
}

Variant.eachVariant = function(fn) {
  Variant.discoverVariants().forEach(fn);
}

module.exports = Variant;