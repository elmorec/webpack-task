const { Command } = require('./command');

class VersionCommand extends Command {
  constructor(o) {
    super(o);
  }

  run() {
    this.utils.logInfo(this.package.version);
    return Promise.resolve();
  }
}

module.exports = VersionCommand;