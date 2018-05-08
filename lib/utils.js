const exec = require('child_process').exec;
const chalk = require('chalk');

function type(o) {
  return Object.prototype.toString.call(o).split(' ')[1].slice(0, -1).toLowerCase()
}

function camelCase(str) {
  return str.replace(/[-\s]([a-z])/g, (a, s) => s.toUpperCase());
}

function pick(o, keys) {
  let out = {};
  keys.forEach(k => {
    if (o.hasOwnProperty(k)) {
      let v = o[k];
      out[k] = Array.isArray(v) ? Array.from(v) : type(v) === 'object' ? Object.assign({}, v) : v;
    }
  });

  return out;
}

function _extends(...args) {
  let [o1, o2, ...rest] = args;
  if (!o2) return o1;

  for (let key in o2) {
    let type2 = type(o2[key]),
      v2 = type2 === 'object' ? Object.assign({}, o2[key]) : type2 === 'array' ? Array.from(o2[key]) : o2[key];

    if (
      !o1.hasOwnProperty(key)
      // force merge from right to left if type of o1 is not the same as the type of o2.
      || type(o1[key]) !== type(o2[key])
    ) o1[key] = v2;

    else if (type2 === 'object')
      o1[key] = _extends(o1[key], v2);

    // merge array only if o1 is empty.
    else if (type2 === 'array' && o1[key].length === 0)
      o1[key] = v2;
  }

  return rest.length ? _extends(o1, ...rest) : o1;
}

function lookupCommand(commands, commandName) {
  let command = findCommand(commands, commandName);

  if (command) {
    return command;
  }

  function aliasMatches(alias) {
    return alias === commandName;
  }

  function findCommand(commands, commandName) {
    for (let key in commands) {
      let command = commands[key];

      let name = command.command;
      let aliases = command.aliases || [];

      if (name === commandName || aliases.some(aliasMatches)) {
        return command;
      }
    }
  }
}
function printCommandMeta (command) { // config.commands.map(c => `oc ${c.name}\n`).join('')
  const output = [];
  output.push(`\nwt ${command.command}`);
  if (command.description)
    output.push(`  ${command.description}`);
  if (validArgs(command.aliases))
    output.push(chalk.gray(`  aliases: ${command.aliases.join(', ')}`));
  if (validArgs(command.options)) {
    output[0] += chalk.cyan(` <option...>`)
    command.options.forEach(op => output.push(
      '  '
      + chalk.cyan('--' + op.name)
      + (op.type ? chalk.cyan(' (' + op.type + ')') : '')
      + (op.description ? ` ${op.description}` : '')
    ));
  }

  return console.log(output.join('\n'));

  function validArgs(o) { return Array.isArray(o) && o.length };
}

function parseArgs(args, options) {
  let cliArgs = {},
    out = {},
    argWithoutKeys = [],
    errors = [];
  const ERRORS = {
    'required': o => `\`${o}\` option is required`,
    'type': o => `\`${o}\` option is invalid`,
    'required': o => `\`${o}\` option is required`,
  }

  for (let arg of args) {
    if (arg.startsWith('--')) {
      arg = arg.substring(2, arg.length).split('=');

      cliArgs[arg[0]] = arg[1] ? arg[1] : true;
    }
    else {
      argWithoutKeys.push(arg);
    }
  }

  options.forEach(option => {
    if (cliArgs.hasOwnProperty(option.name)) {
      out[option.name] = cliArgs[option.name]
    }

    if (option.short && argWithoutKeys.length) {
      out[option.name] = argWithoutKeys[0];
    }

    // validation
    let error = [];
    if (option.required && !out.hasOwnProperty(option.name)) error.push(ERRORS.required(option.name));
    else if (out[option.name] && option.type !== type(out[option.name])) error.push(ERRORS.type(option.name));

    if (error.length) errors.push({ name: option.name, errors: error });
  })

  return [out, errors];
}

[
  { type: 'debug', color: 'gray' },
  { type: 'info', color: 'cyan' },
  { type: 'warn', color: 'yellow' },
  { type: 'error', color: 'red' }
].forEach(({ type, color }) => {
  exports[camelCase('log-' + type)] = function (message) {
    const logFn = console[type] || console.log;
    logFn('  ' + chalk[color](message))
  }
});
exports.log = console.log;

function cmd(c, cwd) {
  return new Promise((resolve, reject) => {
    exec(c, { cwd: cwd }, err => {
      if (err) return reject(err);

      resolve();
    })
  })
}

function template(template, data) {
  let dks = Object.keys(data);
  if (!template || type(template) !== 'string') return ''
  if (!dks.length || type(data) !== 'object') return template;

  dks.forEach(dk => template = template.replace(new RegExp('\\$\\{' + dk + '\\}', 'g'), data[dk]));

  return template;
}

exports.type = type;
exports.pick = pick;
exports.extends = _extends;
exports.lookupCommand = lookupCommand;
exports.printCommandMeta = printCommandMeta;
exports.parseArgs = parseArgs;
exports.camelCase = camelCase;
exports.cmd = cmd;
exports.template = template;