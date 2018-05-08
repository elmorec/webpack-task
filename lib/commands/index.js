exports.commandsMeta = {
  build: {
    command: 'build',
    aliases: ['b'],
    description: 'Builds your app.',
    options: [
      { name: 'page', type: 'string', short: true },
      { name: 'all', type: 'boolean' }
    ]
  },
  serve: {
    command: 'serve',
    aliases: ['s'],
    description: 'Builds and serves your app for development.',
    options: [
      { name: 'page', type: 'string', required: true, short: true }
    ]
  },
  generate: {
    command: 'generate',
    aliases: ['g'],
    description: 'Generates a new page.',
    options: [
      { name: 'page', type: 'string', required: true, short: true },
      { name: 'ts', type: 'boolean' },
      { name: 'title', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'inlineJs', type: 'boolean' },
      { name: 'inlineCss', type: 'boolean' }
    ]
  },
  delete: {
    command: 'delete',
    aliases: ['d'],
    description: 'Deletes an existing page.',
    options: [
      { name: 'page', type: 'string', required: true, short: true }
    ]
  },
  new: {
    command: 'new',
    aliases: ['n'],
    description: 'Initializes a new project.',
    options: [
      { name: 'dir', type: 'string', required: true, short: true },
      { name: 'name', type: 'string' },
      { name: 'root', type: 'string' },
      { name: 'outDir', type: 'string' },
      { name: 'pageDir', type: 'string' },
      { name: 'pageConfig', type: 'string' },
      { name: 'skipInstall', type: 'boolean' }
    ]
  },
  version: {
    command: 'version',
    aliases: ['v'],
    description: ''
  }
};

exports.loadCommands = function () {
  const commands = {};
  for (let key in exports.commandsMeta) {
    commands[key] = require('./' + key);
    Object.assign(commands[key], exports.commandsMeta[key]);
  }

  return commands;
}