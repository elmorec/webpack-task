const path = require('path');
const { Command } = require('../command');
const fs = require('fs-extra');
const voca = require('voca');

class NewCommand extends Command {
  constructor(o) {
    super(o);
  }

  run(parsedArgs) {
    const context = process.cwd();
    if (!parsedArgs.dir) throw new this.Error('`dir` is not specified');
    const projectRoot = path.join(context, parsedArgs.dir);
    if (fs.existsSync(path.join(context, '.webpack-task.json'))) throw new this.Error(`It seems you are in a project root.`);
    if (fs.existsSync(projectRoot)) throw new this.Error(`\`${parsedArgs.dir}\` is already exist.`);

    this.projectRoot = projectRoot;

    this.cliArgs = this.utils.extends(parsedArgs, {
      dir: '',
      name: 'my_project',
      root: 'src',
      outDir: 'dist',
      pageDir: 'page',
      pageConfig: 'page-config.json',
      skipInstall: false
    });

    this.templates = [
      { name: 'README.md', path: '', content: fs.readFileSync(path.resolve(__dirname, './.README.md'), { encoding: 'utf-8' }) },
      { name: 'tsconfig.json', path: '', content: fs.readFileSync(path.resolve(__dirname, './.tsconfig.json'), { encoding: 'utf-8' }) },
      { name: 'package.json', path: '', content: fs.readFileSync(path.resolve(__dirname, './.package.json'), { encoding: 'utf-8' }) },
      { name: '.webpack-task.json', path: '', content: fs.readFileSync(path.resolve(__dirname, './.webpack-task.json'), { encoding: 'utf-8' }) },
      { name: this.cliArgs.pageConfig, path: this.cliArgs.root, content: '{}' },
    ];

    return Promise.resolve()
      .then(() => this._init())
      .then(() => this._install())
      .then(() => this.utils.logInfo(`\`${this.cliArgs.name}\` created`));
  }

  _init() {
    this.utils.logInfo('Creating files.');
    return Promise.resolve()
      .then(() => fs.ensureDir(this.projectRoot))
      .then(() => Promise.all(this.templates.map(template => {
        const dest = path.join(this.projectRoot, template.path);
        const locals = Object.assign(this.cliArgs);
        locals.name = voca.snakeCase(locals.name);

        return fs.ensureDir(dest).then(() => fs.writeFile(path.join(dest, template.name), this.utils.template(template.content, locals)));
      })));
  }

  _install() {
    this.utils.logInfo('Installing devDependencies.');
    return this.cliArgs.skipInstall ? Promise.resolve() : this.utils.cmd('npm install', this.projectRoot);
  }
}

module.exports = NewCommand;