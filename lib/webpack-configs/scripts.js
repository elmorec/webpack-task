const fs = require('fs');
const path = require("path");
const SilentError = require('silent-error');
const utils = require('../utils');

module.exports = function (pageConfig) {
  const {
    projectRoot,
    projectConfig,
    projectConfig: { buildOptions, pageOptions }
  } = this.wco;

  return {
    resolve: {
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [
        { test: /\.(js|ts)$/, loader: 'ts-loader', exclude: /node_modules/ }
      ]
    }
  };
}