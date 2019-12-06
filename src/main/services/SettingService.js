import { ipcMain, dialog } from 'electron';
import WindowManager from '@/modules/WindowManager';
import BaseService from '@/services/BaseService';
import SettingStorage from '@/modules/SettingStorage';

class SettingService extends BaseService {
  /**
   * @property
   * @type {DownloadManager}
   */
  static instance;

  /**
   * @property
   * @type {string}
   */
  static channel = 'setting-service';

  constructor() {
    super();

    this.settingStorage = SettingStorage.getStorage();

    ipcMain.on(SettingService.channel, this.channelIncomeHandler.bind(this));
  }

  /**
   * @returns {SettingService}
   */
  static getService() {
    if (!SettingService.instance) {
      SettingService.instance = new SettingService();
    }

    return SettingService.instance;
  }

  /**
   * Get renderer response channel
   * @param {string} name
   */
  responseChannel(name) {
    return SettingService.channel + `:${name}`;
  }

  /**
   * Show directory selector dialog
   * @param {Object} args
   * @param {Electron.Event} event
   */
  selectDirectoryAction(args, event) {
    dialog.showOpenDialog(
      WindowManager.getWindow('app'),
      {
        properties: ['openDirectory']
      },
      (filePath, bookmarks) => {
        event.returnValue = { filePath, bookmarks };
      }
    )
  }

  getSettingsAction(args, event) {
    let settings = this.settingStorage.getSettings();

    WindowManager.getWindow('app').webContents.send(this.responseChannel('settings'), settings);
  }

  /**
   *
   * @param {Object} args
   * @param {Electron.Event} event
   */
  updateSettingsAction(args, event) {
    let changedSettings = this.settingStorage.setSettings(args.settings);

    WindowManager.getWindow('app').webContents.send(this.responseChannel('change'), changedSettings);
  }
}

export default SettingService;
