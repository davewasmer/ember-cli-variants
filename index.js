/* jshint node: true, sub: true */
'use strict';

var fs           = require('fs-extra');
var defeatureify = require('broccoli-defeatureify');
var defaults     = require('lodash-node/modern/object/defaults');
var Promise      = require('bluebird');
var cpd          = require('ember-cli-copy-dereference');
var Variant      = require('./lib/models/variant');

var ctx = null;

module.exports = {

  name: 'ember-cli-variants',

  included: function(app) {
    this.app = app;
    //
    // This doesn't work - it's the Ember CLI instance of the addon,
    // but this config is needed in the Brocfile instance.
    //
    // this.options = app.options.variants || {};
    // defaults(this.options, {
    //   namespace: app.name,
    //   variants: 'variants.json',
    //   outputDir: 'variants'
    // });
    //
  },

  // contentFor: function(type, config) {
  //   if(type === 'head') {
  //     var metaName = this.options.name + '-variants';
  //     var metaContent = encodeURIComponent(JSON.stringify(this.getVariants()));
  //     return '<meta name="' + metaName + '" content="' + metaContent + '">';
  //   }
  //   return '';
  // },

  postprocessTree: function(type, tree) {
    var self = this;
    if (/*self.app.env === 'production' &&*/ type === 'all') {
      // Cache the build tree at this point, so we can use it in the post-build
      // step, where we can run async work (this hook has to return
      // synchronously)
      exports.variantBaseTree = tree;
      // tree = defeatureify(tree, Variant.getVariant('base').options);
      tree = defeatureify(tree, {});
    }
    return tree;
  },

  postBuild: function() {
    var self            = this;
    var broccoli        = require('broccoli');
    // var variantSelector = process.env.VARIANTS
    // var variants        = Variant.discoverVariants(variantSelector,
                            // self.loadVariants());

    return Promise.resolve([
        {
          name: 'foo',
          options: {}
        }
      ])
      .each(function(variant) {
        if (variant.name !== 'base') {
          console.log(exports.variantBaseTree);
          var variantTree = defeatureify(exports.variantBaseTree, variant.options);
          var builder = new broccoli.Builder(variantTree);
          return builder.build()
            .then(function(result) {
              self.copyToOutputDir(result.directory);
            })
        }
      });
  },

  copyToOutputDir: function(inputPath) {
    // var outputDir = this.options.outputDir;
    var outputDir = 'variants';

    return new Promise(function(resolve) {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirsSync(outputDir);
      }
      resolve(cpd.sync(inputPath, outputDir));
    });
  },

  loadVariants: function(variantsFile) {
    // variantsFile = variantsFile || this.options.variants;
    variantsFile = 'variants.json';
    return JSON.parse(fs.readFileSync(variantsFile, 'utf-8'));
  }

};
