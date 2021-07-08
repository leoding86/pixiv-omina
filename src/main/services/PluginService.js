import { dialog, ipcMain } from 'electron';

import BasePlugin from '@/modules/BasePlugin';
import BaseService from '@/services/BaseService';
import NotificationManager from '@/modules/NotificationManager';
import PluginManager from '@/modules/PluginManager';
import SettingStorage from '@/modules/SettingStorage';
import WindowManager from '@/modules/WindowManager';
import TaskScheduler from '@/modules/TaskScheduler';

class PluginService extends BaseService {
  /**
   * @property
   * @type {PluginService}
   */
  static instance;

  /**
   * @property
   * @type {string}
   */
  static channel = 'plugin-service';

  constructor() {
    super();
    this.pluginManager = PluginManager.getDefault(global.app);
    this.notificationManager = NotificationManager.getDefault();
    this.taskScheduler = TaskScheduler.getDefault();

    this.updateScheduleTaskPool();

    ipcMain.on(PluginService.channel, this.channelIncomeHandler.bind(this));

    debug.log('Plugin service has been initiated');
  }

  /**
   * @returns {PluginService}
   */
  static getService() {
    if (!PluginService.instance) {
      PluginService.instance = new PluginService();
    }

    return PluginService.instance;
  }

  /**
   * Get renderer response channel
   * @param {string} name
   */
  responseChannel(name) {
    return PluginService.channel + `:${name}`;
  }

  /**
   *
   * @param {BasePlugin} plugin
   */
  addPluginScheduleTaskToPool(plugin) {
    if (plugin.taskConfig &&
      plugin.taskConfig.key &&
      plugin.taskConfig.name &&
      plugin.taskConfig.Task
    ) {
      this.taskScheduler.taskPool.addTask({
        key: plugin.taskConfig.key,
        name: plugin.taskConfig.name,
        Task: plugin.taskConfig.Task
      });
    }
  }

  /**
   * @returns {void}
   */
  updateScheduleTaskPool() {
    this.pluginManager.getInternalPlugins().forEach(plugin => {
      this.addPluginScheduleTaskToPool(plugin);
    });

    this.pluginManager.getExternalPlugins().forEach(plugin => {
      this.addPluginScheduleTaskToPool(plugin);
    });
  }

  /**
   * @param {Object} args
   * @param {Electron.Event} event
   */
  loadPluginsAction(args, event) {
    this.sendPluginsLoaded();
  }

  /**
   *
   * @param {object} args
   * @param {Electron.Event} event
   */
  installPluginAction(args, event) {
    dialog.showOpenDialog(
      WindowManager.getWindow('app'),
      {
        properties: ['openDirectory']
      },
      (filePath, bookmarks) => {
        if (filePath.length > 0) {
          try {
            this.pluginManager.installPlugin(filePath[0]);
            this.sendPluginsLoaded();
          } catch (e) {
            this.notificationManager
              .createNotification({ title: `Unable to install plugin` })
              .show();
            debug.log(e);
          }
        }
      }
    );
  }

  /**
   *
   * @param {{id: String}} args
   * @param {Electron.Event} event
   */
  loginAction({ id }, event) {
    let plugin = this.pluginManager.getPlugin(id);

    if (plugin && plugin.loginUrl) {
      let loginWindow = WindowManager.getManager().createWindow('login', {
        parent: WindowManager.getWindow('app'),
        modal: true,
        webPreferences: {
          nodeIntegration: true,
          webviewTag: true
        }
      }, {}, {
        loginUrl: plugin.loginUrl,
        locale: SettingStorage.getDefault().getSetting('locale')
      });

      if (typeof plugin.checkLogined === 'function') {
        loginWindow.on('closed', function() {
          plugin.checkLogined.call(plugin);
        });
      }
    } else {
      this.sendDataToWindow(this.responseChannel('error'), { message: 'CANNOT_GET_PLUGIN' });
    }
  }

  /**
   *
   * @param {{id: string}} args
   * @param {Electron.Event} event
   */
  reloadAction({ id }, event) {
    let plugin = this.pluginManager.reloadPlugin(id);

    this.sendDataToWindow(this.responseChannel('reloaded'), {
      id: plugin.id,
      title: plugin.title || '',
      loginUrl: plugin.loginUrl,
      icon: plugin.icon,
      isExternal: this.pluginManager.isExternalPlugin(plugin),
    });
  }

  /**
   *
   * @returns {void}
   */
  sendPluginsLoaded() {
    let data = [];

    this.pluginManager.getExternalPlugins().forEach(plugin => {
      data.push({
        id: plugin.id,
        title: plugin.title || '',
        loginUrl: plugin.loginUrl,
        icon: plugin.icon,
        isExternal: true
      });
    });

    this.pluginManager.getInternalPlugins().forEach(plugin => {
      data.push({
        id: plugin.id,
        title: plugin.title || '',
        loginUrl: plugin.loginUrl,
        icon: plugin.icon,
        isExternal: false
      });
    });

    this.sendDataToWindow(this.responseChannel('loaded'), data);
  }

  /**
   * Load temprary plugin
   *
   * @param {Object} args
   * @param {Electron.Event} event
   */
  loadTemporaryPluginAction(args, event) {
    dialog.showOpenDialog(
      WindowManager.getWindow('app'),
      {
        properties: ['openDirectory']
      },
      (filePath, bookmarks) => {
        if (filePath.length > 0) {
          this.pluginManager.loadTemporaryPlugin(filePath[0]);
          this.sendPluginsLoaded();
        }
      }
    )
  }

  /**
   * Remove a plugin
   * @param {Object} args
   * @param {Electron.Event} event
   */
  removePluginAction(args, event) {
    this.pluginManager.removePlugin(args.plugin.id);

    /**
     * Notificate the renderer thread that plugin has been removed
     */
    this.sendDataToWindow(this.responseChannel('removed'), args.plugin.id);
  }
}

export default PluginService;
