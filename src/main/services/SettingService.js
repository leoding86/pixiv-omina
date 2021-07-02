import fs from 'fs';
import path from 'path';
import { ipcMain, dialog, shell } from 'electron';
import WindowManager from '@/modules/WindowManager';
import BaseService from '@/services/BaseService';
import SettingStorage from '@/modules/SettingStorage';
import GetPath from '@/modules/Utils/GetPath';

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
        try {
          fs.accessSync(filePath, fs.constants.W_OK);
          event.returnValue = { filePath, bookmarks };
        } catch (error) {
          event.returnValue = null;
          throw new Error('You don\'t have permission to write file(s) to the location');
        }
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
    try {
      let changedSettings = this.settingStorage.setSettings(args.settings);
      WindowManager.getWindow('app').webContents.send(this.responseChannel('change'), changedSettings);
    } catch (e) {
      WindowManager.getWindow('app').webContents.send(this.responseChannel('permission-error'));
    }
  }

  /**
   * Reset settings action
   * @returns {void}
   */
  resetSettingsAction() {
    let defaultSettings = this.settingStorage.getDefaultSettings();

    WindowManager.getWindow('app').webContents.send(this.responseChannel('change'), defaultSettings);
  }

  /**
   * Open log file
   */
  openLogsAction() {
    shell.openItem(path.join(GetPath.userData(), 'app.log'));
  }
}

export default SettingService;
