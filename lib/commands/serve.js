const { Command } = require('./command');
const ServeTask = require('../tasks/serve');

class ServeCommand extends Command {
  constructor(o) {
    super(o);
    this.task = new ServeTask(o);
  }

  run(parsedArgs) {
    this.projectConfig.buildOptions.target = 'development';

    if (!this.pageConfig.hasOwnProperty(parsedArgs.page)) throw new this.Error(`Unknow page \`${parsedArgs.page}\`.`);

    return this.task.run(parsedArgs.page)
      .then(stats => this.utils.log(stats.toString(statsMeta)));
  }
}

module.exports = ServeCommand;