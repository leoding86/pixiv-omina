import { FormatName, GetPath } from '@/modules/Utils';

import Application from '@/Application';
import BasePlugin from '@/modules/BasePlugin';
import BaseProvider from '@/modules/Downloader/Providers/BaseProvider';
import Download from '@/modules/Download';
import DownloadAdapter from '@/modules/Downloader/DownloadAdapter';
import EventEmitter from 'events';
import NotificationManager from '@/modules/NotificationManager';
import Request from '@/modules/Request';
import RequestHeadersOverrider from '@/modules/RequestHeadersOverrider';
import ResponseHeadersOverrider from '@/modules/ResponseHeadersOverrider';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import { debug } from '@/global';
import fs from 'fs-extra';
import md5 from 'md5';
import { parse } from 'node-html-parser';
import path from 'path';

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
     * @type {Map<String, BasePlugin>}
     */
    this.internalPlugins = new Map();

    /**
     * @type {Map<String, BasePlugin>}
     */
    this.externalPlugins = new Map();

    /**
     * @type {String}
     */
    this.pluginPath = path.join(GetPath.installation(), 'plugins');

    /**
     * @type {NotificationManager}
     */
    this.notificationManager = NotificationManager.getDefault();

    this.initial();
  }

  /**
   * @param {Application} [app]
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
   * Initial internal plugins
   * @returns {void}
   */
  initalPlugins() {
    if (fs.pathExistsSync(this.pluginPath)) {
      let files = fs.readdirSync(this.pluginPath);

      files.forEach(file => {
        let plugin = this.loadPlugin(path.join(this.pluginPath, file));

        /**
         * Put the plugin to internal scope
         */
        this.internalPlugins.set(plugin.id, plugin);
      });
    }
  }

  /**
   * Load plugin from entry point
   * @param {String} entry
   */
  loadPlugin(entry) {
    let pluginMainFile = '';

    if (fs.existsSync(entry) && fs.lstatSync(entry).isDirectory()) {
      pluginMainFile = path.join(entry, 'main.js');

      if (fs.existsSync(pluginMainFile) && fs.lstatSync(pluginMainFile).isFile) {
        return this.createPlugin(pluginMainFile);
      }
    }

    debug.log(`Cannot load plugin from entry ${entry}`);

    this.notificationManager
        .createNotification({ title: `Unable to load plugin` })
        .show();
  }

  /**
   * @param {string} file
   * @returns {BasePlugin}
   */
  createPlugin(file) {
    if (__non_webpack_require__.cache[file]) {
      delete __non_webpack_require__.cache[file];
    }

    let module = __non_webpack_require__(file),
        plugin = this.bootPlugin(module, file);

    return plugin;
  }

  /**
   * @param {any} plugin
   * @param {String} file
   * @returns {any}
   */
  bootPlugin(plugin, file) {
    try {
      let pluginInstance = plugin({
        app: this.app,
        utils: {
          GetPath,
          FormatName,
          md5,
          parse,
          debug
        },
        classes: {
          BasePlugin,
          BaseProvider,
          WorkDownloader,
          Request,
          Download
        }
      });

      pluginInstance.providerName = pluginInstance.entryFile = file;
      pluginInstance.id = md5(file);

      if (!pluginInstance.title) {
        pluginInstance.title = file;
      }

      DownloadAdapter.extendMap({
        provider: pluginInstance,
        patterns: pluginInstance.patterns
      });

      if (typeof pluginInstance.requestHeadersOverrider === 'function' &&
          pluginInstance.requestUrlPatterns
      ) {
        RequestHeadersOverrider.getDefault().extendMap({
          id: pluginInstance.id,
          patterns: pluginInstance.requestUrlPatterns,
          requestHeaders: pluginInstance.requestHeadersOverrider
        });
      }

      if (typeof pluginInstance.responseHeadersOverrider === 'function' &&
          pluginInstance.responseUrlPatterns
      ) {
        ResponseHeadersOverrider.getDefault().extendMap({
          id: pluginInstance.id,
          patterns: pluginInstance.responseUrlPatterns,
          responseHeaders: pluginInstance.responseHeadersOverrider
        });
      }

      return pluginInstance;
    } catch (error) {
      this.notificationManager
          .createNotification({ title: `Unable to boot plugin. Boot file: ${file}` })
          .show();
      debug.log(error);
    }
  }

  /**
   * Get internal plugins
   * @returns {BasePlugin[]}
   */
  getInternalPlugins() {
    return Array.from(this.internalPlugins.values());
  }

  /**
   * Get external plugins
   * @returns {BasePlugin[]}
   */
  getExternalPlugins() {
    return Array.from(this.externalPlugins.values());
  }

  /**
   * Get all booted plugins
   * @returns {any[]}
   */
  getPlugins() {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin instance
   * @param {String} id
   * @returns {any|null}
   */
  getPlugin(id) {
    if (this.internalPlugins.has(id)) {
      return this.internalPlugins.get(id);
    } else if (this.externalPlugins.has(id)) {
      return this.externalPlugins.get(id);
    } else {
      return null;
    }
  }

  /**
   * Reload plugin
   * @param {string} id
   * @throws {Error}
   */
  reloadPlugin(id) {
    let plugin;

    if (typeof id === 'string') {
      plugin = this.getPlugin(id);
    }

    if (plugin) {
      plugin.uninstall();

      let reloadedPlugin = this.createPlugin(plugin.entryFile);

      this.updatePluginInstance(id, reloadedPlugin);

      return reloadedPlugin;
    } else {
      throw new Error('_unable_to_reload_plugin');
    }
  }

  /**
   * Remove a plugin via its id
   * @param {String} id Plugin's id
   * @returns {void}
   */
  removePlugin(id) {
    let plugin;

    if (this.internalPlugins.has(id)) {
      plugin = this.internalPlugins.get(id);
      this.internalPlugins.delete(id);
    } else if (this.externalPlugins.has(id)) {
      plugin = this.externalPlugins.get(id);
      this.externalPlugins.delete(id);
    } else {
      debug.log(`There isn't plugin [id] to remove`);
    }

    if (plugin) {
      plugin.uninstall();
    }
  }

  /**
   * Load a plugin temprarily
   * @param {String} entry Plugin entry folder
   * @returns {void}
   */
  loadTempraryPlugin(entry) {
    let plugin = this.loadPlugin(entry);

    if (plugin) {
      /**
       * Put the plugin to external scope
       */
      this.externalPlugins.set(plugin.id, plugin);
    }
  }

  /**
   * Update plugin's instance in the scope
   * @param {String} id
   * @param {BasePlugin} plugin
   * @returns {void}
   */
  updatePluginInstance(id, plugin) {
    if (this.internalPlugins.has(id)) {
      this.internalPlugins.set(id, plugin);
    } else if (this.externalPlugins.has(id)) {
      this.externalPlugins.set(id, plugin);
    }
  }

  /**
   * Install a plugin.
   * @param {string} entry File or Folder
   */
  installPlugin(entry) {
    throw new Error('Method installPlugin has not been implmeneted');
  }

  /**
   * Uninstall a plugin
   * @param {String} entry Entry file for the plugin
   */
  uninstallPlugin(entry) {
    throw new Error('Method uninstallPlugin has not been implemented');
  }
}

export default PluginManager;
