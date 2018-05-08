const fs = require('fs-extra');
const path = require('path');
const SilentError = require('silent-error');
const utils = require('../utils');
const pkg = require('../../package.json');

class Command {
  constructor({ projectConfig, pageConfig }) {
    this.package = pkg;
    this.projectConfig = Object.assign({}, projectConfig);
    this.pageConfig = pageConfig;
    this.Error = SilentError;
    this.utils = utils;
  }

  /**
   * @param {Object} parsedArgs
   * @returns {Promise}
   * @memberof Command
   */
  run(parsedArgs) { }
}

class PageCommand extends Command {
  constructor(o) {
    super(o);
  }
  updateConfigFile() {
    const pageConfigPath = path.resolve(this.projectConfig.root, this.projectConfig.pageConfig);
    const pageNames = Object.keys(this.pageConfig).sort();

    fs.writeFileSync(pageConfigPath, JSON.stringify(utils.pick(this.pageConfig, pageNames), null, 2));
    this.utils.logInfo(`\`${this.projectConfig.pageConfig}\` updated`);
  }
  deletePage(pageName) {
    const pagePath = path.resolve(process.cwd(), this.projectConfig.root, this.projectConfig.pageDir, pageName);
    fs.removeSync(pagePath)
  }
  createPage(pageName, arg) {
    const pagePath = path.resolve(process.cwd(), this.projectConfig.root, this.projectConfig.pageDir, pageName, `${arg.name || this.projectConfig.pageOptions.defaultName}.${arg.ts ? 'ts' : 'js'}`);
    fs.ensureFileSync(pagePath, '');
  }
}

exports.Command = Command;
exports.PageCommand = PageCommand;