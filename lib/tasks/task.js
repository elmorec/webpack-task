const SilentError = require('silent-error');
const utils = require('../utils');

class Task {
  constructor({ projectConfig, pageConfig }) {
    this.projectConfig = Object.assign({}, projectConfig);
    this.pageConfig = pageConfig;
    this.Error = SilentError;
    this.utils = utils;
  }
}

module.exports = Task;