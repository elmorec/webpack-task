const webpack = require('webpack');
const path = require('path');
const HtmlResWebpackPlugin = require('html-res-webpack-plugin');
const utils = require('./utils');

module.exports = function (pageConfig) {
  const {
    projectRoot,
    projectConfig,
    projectConfig: { buildOptions, pageOptions }
  } = this.wco;

  const extraPlugins = [];
  // Minify/optimize assets in production.
  const minimize = buildOptions.target === 'production';

  if (buildOptions.sourcemaps && buildOptions.target === 'development') {
    extraPlugins.push(new webpack.EvalSourceMapDevToolPlugin({
      moduleFilenameTemplate: '[resource-path]',
      sourceRoot: 'webpack:///'
    }));
  }

  pageConfig.pages.forEach(page => {
    extraPlugins.push(new HtmlResWebpackPlugin({
      filename: `${page.name}.html`,
      template: page.template,
      chunks: {
        [`${page.name}.js`]: { inline: minimize && page.inlineJs },
        [`${page.name}.css`]: { inline: minimize && page.inlineCss }
      },
      htmlMinify: {
        removeComments: minimize,
        collapseWhitespace: minimize,
        collapseInlineTagWhitespace: minimize,
        minifyCSS: minimize,
        minifyJS: minimize
      },
      templateContent: (html) => {
        const regex = /<title.*?>.*<\/title>/i;
        const matches = html.match(regex);
        if (!matches) {
          html = html.replace(/<\/head>/i, `<title>${page.title}</title>` + '$&');
        }
        else {
          const modified = matches[0].replace(regex, `<title>${page.title}</title>`);
          html = html.replace(regex, modified);
        }

        return html;
      }
    }));
  });

  return {
    resolve: {
      mainFields: ['browser', 'module', 'main', 'es2015']
    },
    module: {
      rules: [
        { test: /\.html$/, loader: 'html-loader' },
        { test: /\.pug$/, loader: 'pug-loader' }
      ]
    },
    plugins: [].concat(extraPlugins),
    node: {
      fs: 'empty',
      global: true,
      crypto: 'empty',
      tls: 'empty',
      net: 'empty',
      process: true,
      module: false,
      clearImmediate: false,
      setImmediate: false
    }
  };
}