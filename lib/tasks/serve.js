const fs = require("fs-extra");
const path = require('path');
const webpack = require('webpack');
const Server = require('webpack-dev-server');
const ip = require('ip');
const Task = require('./task');
const WebpackConfig = require('../webpack-configs');

const defaultServeOptions = {
  host: '',
  port: 80,
  headers: { 'Access-Control-Allow-Origin': '*' },
  open: true,
  stats: {
    colors: true,
    hash: true,
    timings: true,
    chunks: true,
    chunkModules: false,
    children: false,
    modules: false,
    reasons: false,
    warnings: true,
    assets: false,
    version: false
  },
  publicPath: '',
  hot: true,
  inline: true,
  historyApiFallback: true
};

class Serve extends Task {
  constructor(o) {
    super(o);
    this.wpconfig = new WebpackConfig(this.projectConfig);
  }

  run(pageName) {
    const pageConfig = this.pageConfig[pageName];
    if (this.projectConfig.buildOptions.deleteOutputPath) {
      fs.removeSync(path.resolve(this.projectConfig.outDir, pageName));
    }

    const serveOptions = this.projectConfig.serveOptions;
    const wpconfig = this.wpconfig.buildConfig(pageName, pageConfig);

    return new Promise((resolve, reject) => {
      // TODO:
      // append HMR
      let options = Object.assign({}, defaultServeOptions, { host: serveOptions.host, port: serveOptions.port });
      let devClient = [`webpack-dev-server/client?http://${options.host}:${options.port}`, 'webpack/hot/dev-server'];

      // caution !!!
      options.publicPath = wpconfig.output.publicPath;

      Object.keys(wpconfig.entry).forEach(function (key) {
        wpconfig.entry[key] = devClient.concat(wpconfig.entry[key]);
      });

      let uri = `${options.host === '0.0.0.0' ? ip.address() : options.host}:${options.port}/${options.publicPath}/${Object.keys(wpconfig.entry)[0]}.html`;

      uri = uri.replace(/\/{2,}/g, '/');

      console.log(`Result is served from http://${uri}`);

      new Server(webpack(wpconfig), options)
        .listen(options.port, options.host, (err, _stats) => {
          if (err) {
            reject(err)
          }
        });
    });
  }
}

module.exports = Serve;