import EventEmitter from 'events';
import path from 'path';
import fs from 'fs-extra';
import { GetPath, FormatName } from '@/modules/Utils';
import Application from '@/Application';
import BasePlugin from '@/modules/BasePlugin';
import BaseProvider from '@/modules/Downloader/Providers/BaseProvider';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import Request from '@/modules/Request';
import Download from '@/modules/Download';
import DownloadAdapter from '@/modules/Downloader/DownloadAdapter';
import RequestHeadersOverrider from '@/modules/RequestHeadersOverrider';
import ResponseHeadersOverrider from '@/modules/ResponseHeadersOverrider';
import md5 from 'md5';
import { parse } from 'node-html-parser';
import NotificationManager from '@/modules/NotificationManager';
import { debug } from '@/global';

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
     * @type {any[]}
     */
    this.plugins = [];

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
   * @returns void
   */
  initalPlugins() {
    if (fs.pathExistsSync(this.pluginPath)) {
      let files = fs.readdirSync(this.pluginPath),
          pluginFolder = '',
          pluginMainFile = '';

      files.forEach(file => {
        if (/.*\.js/.test(file)) {
          this.plugins.push(this.createPlugin(path.join(this.pluginPath, file)));
        } else  {
          pluginFolder = path.join(this.pluginPath, file);

          if (fs.existsSync(pluginFolder) && fs.lstatSync(pluginFolder).isDirectory()) {
            pluginMainFile = path.join(pluginFolder, 'main.js');

            if (fs.existsSync(pluginMainFile) && fs.lstatSync(pluginMainFile).isFile) {
              this.plugins.push(this.createPlugin(pluginMainFile));
            }
          }
        }
      });
    }
  }

  /**
   * @param {string} file
   * @returns {void}
   */
  createPlugin(file) {
    return this.bootPlugin(__non_webpack_require__(file), file);
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

      pluginInstance.providerName = file;
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
      this.notificationManager.showNotification({ title: `Unable to boot plugin. Boot file: ${file}` });
      debug.log(error);
    }
  }

  /**
   * Get all booted plugins
   * @returns {any[]}
   */
  getPlugins() {
    return this.plugins;
  }

  /**
   * Get plugin instance
   * @param {String} id
   * @returns {any|null}
   */
  getPlugin(id) {
    for (let i = 0; i < this.plugins.length; i++) {
      if (id === this.plugins[i].id) {
        return this.plugins[i];
      }
    }

    return null;
  }
}

export default PluginManager;
