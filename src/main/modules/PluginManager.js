import EventEmitter from 'events';
import path from 'path';
import fs from 'fs-extra';
import GetPath from '@/modules/Utils/GetPath';
import Application from '@/Application';

class PluginManager extends EventEmitter {
  /**
   * @type {PluginManager}
   */
  static instance = null;

  /**
   * @constructor
   */
  constructor(app) {
    super();

    /**
     * @type {Application}
     */
    this.app = app;

    /**
     * @type any[]
     */
    this.plugins = [];

    this.pluginPath = path.join(GetPath.installation(), 'plugins');

    this.initial();
  }

  /**
   * @returns PluginManager
   */
  static getDefault(app) {
    if (PluginManager.instance === null) {
      PluginManager.instance = new PluginManager(app);
    }

    return PluginManager.instance;
  }

  /**
   * @returns void
   */
  initial() {
    this.initalPlugins();
  }

  /**
   * @returns void
   */
  initalPlugins() {
    if (fs.pathExistsSync(this.pluginPath)) {
      let files = fs.readdirSync(this.pluginPath);

      files.forEach(file => {
        if (/.*\.js/.test(file)) {
          this.plugins.push(this.createPlugin(file));
        }
      });
    }
  }

  /**
   * @param {string} file
   * @returns {void}
   */
  createPlugin(file) {
    return this.bootPlugin(__non_webpack_require__(path.join(this.pluginPath, file)));
  }

  /**
   * @param {any} plugin
   * @returns {void}
   */
  bootPlugin(plugin) {
    return new plugin(this.app);
  }
}

export default PluginManager;
