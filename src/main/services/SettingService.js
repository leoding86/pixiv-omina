import { ipcMain, dialog } from 'electron';
import WindowManager from '@/modules/WindowManager';
import BaseService from '@/services/BaseService';
import Setting from '@/modules/Setting';

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

  selectDirectoryAction(args, event) { //
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
}

export default SettingService;
