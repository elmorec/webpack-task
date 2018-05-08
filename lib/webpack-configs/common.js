const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CircularDependencyPlugin = require('circular-dependency-plugin');
const utils = require('./utils');

module.exports = function (pageConfig) {
  const {
    projectRoot,
    projectConfig,
    projectConfig: { buildOptions, pageOptions }
  } = this.wco;

  const appRoot = path.resolve(projectRoot, projectConfig.root);
  const extraPlugins = [];
  const extraRules = [];
  const entryPoints = {};

  pageConfig.pages.forEach(page => {
    entryPoints[page.name] = [path.resolve(appRoot, projectConfig.pageDir, pageConfig.entry, page.name)];
  });

  // determine hashing format
  const hashFormat = utils.getOutputHashFormat(
    buildOptions.target === 'production' ?
      buildOptions.outputHashing :
      'none'
  );

  if (buildOptions.progress) {
    extraPlugins.push(new webpack.ProgressPlugin({ profile: buildOptions.verbose }));
  }
  if (buildOptions.showCircularDependencies) {
    extraPlugins.push(new CircularDependencyPlugin({
      exclude: /(\\|\/)node_modules(\\|\/)/
    }));
  }

  let publicPath = '';
  if (buildOptions.target === 'development') {
    publicPath = path.join(buildOptions.deployUrl, pageConfig.entry).replace(/(\/+|\\+)/g, '/') + '/';
    if (!publicPath.startsWith('/')) publicPath = '/' + publicPath;
  }

  return {
    entry: entryPoints,
    output: {
      path: path.resolve(projectConfig.outDir, pageConfig.entry, pageConfig.dist),
      publicPath: publicPath,
      filename: `${hashFormat.chunk}.js`,
    },
    module: {
      rules: [
        {
          test: /\.(eot|svg|cur|mp3|ogg|mp4)$/,
          loader: 'file-loader',
          options: { name: `${hashFormat.file}.[ext]` }
        },
        {
          test: /\.(jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/,
          loader: 'url-loader',
          options: {
            name: `${hashFormat.file}.[ext]`,
            limit: 4000
          }
        }
      ].concat(extraRules)
    },
    plugins: [
      new webpack.NoEmitOnErrorsPlugin()
    ].concat(extraPlugins)
  };
}