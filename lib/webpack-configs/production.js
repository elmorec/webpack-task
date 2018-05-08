const path = require("path");
const SilentError = require('silent-error');
const webpack = require('webpack');

module.exports = function (pageConfig) {
  const {
    projectRoot,
    projectConfig,
    projectConfig: { buildOptions, pageOptions }
  } = this.wco;

  const extraPlugins = [];

  return {
    plugins: [
      new webpack.EnvironmentPlugin({
        'NODE_ENV': 'production'
      }),
      new webpack.HashedModuleIdsPlugin(),
      new webpack.optimize.ModuleConcatenationPlugin(),
      ...extraPlugins,
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: buildOptions.sourcemaps,
        uglifyOptions: {
          warnings: buildOptions.verbose,
          ie8: false,
          mangle: {
            safari10: true,
          },
          output: {
            ascii_only: true,
            comments: false,
            webkit: true,
          },
        }
      }),
    ]
  };
}