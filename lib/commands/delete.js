const { PageCommand: Command } = require('./command');

class GenerateCommand extends Command {
  constructor(o) {
    super(o);
  }

  run(parsedArgs) {
    if (!this.pageConfig.hasOwnProperty(parsedArgs.page)) throw new this.Error(`Unknow page \`${parsedArgs.page}\`.`);

    // delete page folder
    this.deletePage(parsedArgs.page);
    this.utils.logInfo(`\`${parsedArgs.page}\` deleted`);

    // update config file
    delete this.pageConfig[parsedArgs.page];
    this.updateConfigFile();
    return Promise.resolve();
  }
}

module.exports = GenerateCommand;