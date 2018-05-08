const path = require("path");
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const customProperties = require('postcss-custom-properties');
const utils = require('./utils');

module.exports = function (pageConfig) {
  const {
    projectRoot,
    projectConfig,
    projectConfig: { buildOptions, pageOptions }
  } = this.wco;

  const extraPlugins = [];

  const cssSourceMap = buildOptions.extractCss && buildOptions.sourcemaps;
  // Minify/optimize css in production.
  const minimizeCss = buildOptions.target === 'production';
  const extractCss = buildOptions.extractCss && buildOptions.target === 'production';
  // Convert absolute resource URLs to account for base-href and deploy-url.
  const baseHref = buildOptions.baseHref || '';
  const deployUrl = buildOptions.deployUrl || '';

  // determine hashing format
  const hashFormat = utils.getOutputHashFormat(
    buildOptions.target === 'production' ?
      buildOptions.outputHashing :
      'none'
  );
  const postcssPluginCreator = function () {
    // safe settings based on: https://github.com/ben-eb/cssnano/issues/358#issuecomment-283696193
    const importantCommentRe = /@preserve|@licen[cs]e|[@#]\s*source(?:Mapping)?URL|^!/i;
    const minimizeOptions = {
      autoprefixer: false,
      safe: true,
      mergeLonghand: false,
      discardComments: { remove: (comment) => !importantCommentRe.test(comment) }
    };
    return [
      autoprefixer(),
      customProperties({ preserve: true })
    ].concat(minimizeCss ? [cssnano(minimizeOptions)] : []);
  };

  const baseRules = [
    { test: /\.css$/, use: [] },
    {
      test: /\.scss$|\.sass$/, use: [{
        loader: 'sass-loader',
        options: {
          sourceMap: cssSourceMap,
          // bootstrap-sass requires a minimum precision of 8
          precision: 8
        }
      }]
    },
  ];
  const commonLoaders = [
    {
      loader: 'css-loader',
      options: {
        sourceMap: cssSourceMap,
        importLoaders: 1,
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        // A non-function property is required to workaround a webpack option handling bug
        ident: 'postcss',
        plugins: postcssPluginCreator,
        sourceMap: cssSourceMap
      }
    }
  ];
  const rules = baseRules.map(({ test, use }) => ({
    test, use: extractCss ?
      ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [...commonLoaders, ...use]
      })
      : ['style-loader', ...commonLoaders, ...use],
    exclude: /node_modules/
  }));
  if (extractCss) {
    extraPlugins.push(new ExtractTextPlugin({ filename: `${hashFormat.extract}.css` }));
  }
  return {
    module: { rules },
    plugins: [].concat(extraPlugins)
  };
}