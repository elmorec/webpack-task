const { Command } = require('./command');
const BuildTask = require('../tasks/build');

class BuildCommand extends Command {
  constructor(o) {
    super(o);
    this.task = new BuildTask(o);
  }

  run(parsedArgs) {
    this.projectConfig.buildOptions.target = parsedArgs.dev || parsedArgs.development ?
      'development' : 'production';

    if (!parsedArgs.all && !parsedArgs.page) throw new this.Error('`--page` or `--all` is required');

    if (parsedArgs.all) {
      let pageNames = Object.keys(this.pageConfig);
      let fn = () => {
        if (!pageNames.length) return Promise.resolve();

        return this._runTask(pageNames.shift(), 1).then(fn);
      };

      return fn();
    }

    if (!this.pageConfig.hasOwnProperty(parsedArgs.page)) throw new this.Error(`Unknow page \`${parsedArgs.page}\`.`);
    return this._runTask(parsedArgs.page);
  }

  _runTask(pageName, hideDetail) {
    let statsMeta = {
      modules: false,
      children: false,
      chunks: false,
      hash: false,
      chunkModules: false,
      version: false,
      assets: !hideDetail
    };
    return this.task.run(pageName)
      .then(stats => this.utils.log(stats.toString(statsMeta)));
  }
}

module.exports = BuildCommand;