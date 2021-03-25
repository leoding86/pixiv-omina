import { ipcMain } from 'electron';
import BaseService from '@/services/BaseService';
import PluginManager from '@/modules/PluginManager';
import WindowManager from '@/modules/WindowManager';
import SettingStorage from '@/modules/SettingStorage';

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
    this.pluginManager = PluginManager.getDefault();
    ipcMain.on(PluginService.channel, this.channelIncomeHandler.bind(this));
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
   * @param {Object} args
   * @param {Electron.Event} event
   */
  loadPluginsAction(args, event) {
    this.sendPluginsLoaded();
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
   * @returns {void}
   */
  sendPluginsLoaded() {
    let data = [];

    this.pluginManager.getPlugins().forEach(plugin => {
      data.push({
        id: plugin.id,
        title: plugin.title || '',
        loginUrl: plugin.loginUrl,
        icon: plugin.icon
      });
    });

    this.sendDataToWindow(this.responseChannel('loaded'), data);
  }
}

export default PluginService;
