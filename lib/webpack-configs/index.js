const path = require("path");
const webpackMerge = require('webpack-merge');
const utils = require('../utils');

class WebpackConfig {
  constructor(projectConfig) {
    const projectRoot = process.cwd();
    this.wco = { projectRoot, projectConfig };
  }

  buildConfig(page, config) {
    let pageConfig = this.normalizePageConfig(page, config);

    let webpackConfigs = [
      require('./common').call(this, pageConfig),
      require('./browser').call(this, pageConfig),
      require('./styles').call(this, pageConfig),
      this.getTargetConfig(this.wco.projectConfig.buildOptions.target).call(this, pageConfig),
      require('./scripts').call(this, pageConfig),
    ];

    this.config = webpackMerge(webpackConfigs);
    return this.config;
  }

  getTargetConfig(target) {
    const targets = {
      development: 'development',
      production: 'production',
    };

    return require(`./${targets[target] || targets.production}`);
  }

  normalizePageConfig(page, config) {
    const pageOptions = this.wco.projectConfig.pageOptions;
    const defaults = {
      entry: '',
      dist: '',
      pages: [{
        name: pageOptions.defaultName,
        title: pageOptions.defaultTitle,
        inlineJs: pageOptions.inlineJs,
        inlineCss: pageOptions.inlineCss,
        template: path.resolve(__dirname, 'template.html'),
        externals: []
      }]
    };

    if (
      typeof config === 'string' // mypage: 'Untitled'
      || !config                 // mypage: null
    ) {
      config = {
        pages: [
          { title: config }
        ]
      };
    }

    /**
     * mypages: [
     *   { name: 'untitled1', title: 'Untitled 1' },
     *   { name: 'untitled2', title: 'untitled2 2' },
     * ]
     */
    else if (Array.isArray(config)) {
      config = {
        pages: config
      }
    }

    /**
     * mypage: { name: 'index', title: 'Untitled' }
     */
    else if (utils.type(config) === 'object') {
      if (!Array.isArray(config.pages)) {
        config = {
          pages: [config],
          dist: config.dist
        }
      }
    }

    // assign with defaults
    config = utils.extends(
      config,
      { entry: page },
      utils.pick(defaults, ['dist'])
    );
    config.pages = config.pages.map(page => utils.extends({}, page, defaults.pages[0]))

    return config;
  }
}

module.exports = WebpackConfig;