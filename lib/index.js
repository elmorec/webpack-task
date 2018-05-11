const fs = require('fs');
const path = require('path');
const SilentError = require('silent-error');
const commands = require('./commands');
const utils = require('./utils');
const defaults = require('./config.json');

module.exports = function (cwd, args) {
  cwd = cwd || process.cwd();
  args = args || process.argv.slice(2);

  return Promise.resolve().then(() => {
    let commandName = args.shift();
    if (!commandName) {
      utils.log('Available commands');
      for (let key in commands.commandsMeta) utils.printCommandMeta(commands.commandsMeta[key]);
      return;
    }
    let CurrentCommand = utils.lookupCommand(commands.loadCommands(), commandName);
    if (!CurrentCommand) {
      throw new SilentError(`Unknow command \`${commandName}\`.`);
    }

    let [parsedArgs, argsErrors] = utils.parseArgs(args, CurrentCommand.options || []);

    if (argsErrors.length) throw new SilentError(argsErrors[0].errors[0]);

    // bypass common commands
    if (['new', 'version'].indexOf(CurrentCommand.command) !== -1) return new CurrentCommand({ projectConfig: {}, pageConfig: {} }).run(parsedArgs);

    // parse configs
    const customConfigPath = path.join(cwd, './.webpack-task.json');
    let projectConfig = null;

    if (!fs.existsSync(customConfigPath)) {
      utils.logWarn('No `.webpack-task.json` found, using defaults.');
      projectConfig = utils.extends({}, defaults);
    } else {
      try {
        projectConfig = utils.extends({}, require(customConfigPath), defaults);
      } catch (e) {
        utils.logWarn('Unable to parse `.webpack-task.json`, using defaults.');
        projectConfig = utils.extends({}, defaults);
      }
    };

    const pageConfigPath = path.resolve(projectConfig.root, projectConfig.pageConfig);
    let pageConfig = null;

    if (!fs.existsSync(pageConfigPath)) {
      throw new SilentError(`No page config found.`);
    } else {
      try {
        pageConfig = require(pageConfigPath);
      } catch (e) {
        throw new SilentError(`Unable to parse \`${projectConfig.pageConfig}.json\`.`);
      }
    };

    // normalize options
    if (parsedArgs.page) parsedArgs.page = parsedArgs.page.replace(/(\\|\/)+/g, '/').replace(/(^\/|\/$)/g, '');

    let command = new CurrentCommand({
      projectConfig: projectConfig,
      pageConfig: pageConfig
    });

    return command.run(parsedArgs)

  }).catch(e => utils.logError(e.stack || e.message));
}