const { PageCommand: Command } = require('./command');

class GenerateCommand extends Command {
  constructor(o) {
    super(o);
  }

  run(parsedArgs) {
    if (this.pageConfig.hasOwnProperty(parsedArgs.page)) throw new this.Error(`\`${parsedArgs.page}\` is already exist.`);
    for (let key of Object.keys(this.pageConfig)) {
      // page is parent folder to key
      if (key.indexOf(parsedArgs.page) === 0
        // siblings will bypass
        && /\//.test(parsedArgs.page.substring(key.length))
      ) throw new this.Error(`\`${key}\` is already exist.`);

      // page is sub folder to key
      else if (parsedArgs.page.indexOf(key) === 0
        // siblings will bypass
        && /\//.test(parsedArgs.page.substring(key.length))
      ) throw new this.Error(`\`${key}\` is already exist.`);
    }

    // generate
    this.createPage(parsedArgs.page, parsedArgs);
    this.utils.logInfo(`\`${parsedArgs.page}\` generated`);

    // update config file
    let config = this.utils.pick(parsedArgs, ['name', 'title', 'inlineJs', 'inlineCss', 'template', 'externals']);
    if (Object.keys(config).length <= 1) {
      if (config.title) config = config.title;
      else config = null;
    }
    this.pageConfig[parsedArgs.page] = config;
    this.updateConfigFile();

    return Promise.resolve();
  }
}

module.exports = GenerateCommand;