const path = require("path");
const SilentError = require('silent-error');
const webpack = require("webpack");

module.exports = function (pageConfig) {
  const {
    projectRoot,
    projectConfig,
    projectConfig: { buildOptions, pageOptions }
  } = this.wco;

  return {
    plugins: [
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
    ]
  };
}