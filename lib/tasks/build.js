const fs = require("fs-extra");
const path = require('path');
const webpack = require('webpack');
const Task = require('./task');
const WebpackConfig = require('../webpack-configs');

class Build extends Task {
  constructor(o) {
    super(o);
    this.wpconfig = new WebpackConfig(this.projectConfig);
  }

  run(pageName) {
    const pageConfig = this.pageConfig[pageName];
    if (this.projectConfig.buildOptions.deleteOutputPath) {
      fs.removeSync(path.resolve(this.projectConfig.outDir, pageName));
    }

    return new Promise((resolve, reject) => {
      webpack(this.wpconfig.buildConfig(pageName, pageConfig), (err, stats) => {
        if (err)
          return reject(err);

        resolve(stats);
      });
    });
  }
}

module.exports = Build;