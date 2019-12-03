import {
  ipcMain
} from 'electron';
import BaseService from './BaseService';
import WindowManager from '@/modules/WindowManager';

class DebugService extends BaseService {
  /**
   * @property
   * @type {DebugService}
   */
  static instance;

  /**
   * @property
   * @type {string}
   */
  static channel = 'debug-service';

  constructor() {
    super();

    ipcMain.on(DebugService.channel, this.channelIncomeHandler.bind(this));
  }

  /**
   * @returns {DebugService}
   */
  static getService() {
    if (!DebugService.instance) {
      DebugService.instance = new DebugService();
    }

    return DebugService.instance;
  }

  /**
   * Get renderer response channel
   * @param {string} name
   */
  responseChannel(name) {
    return DebugService.channel + `:${name}`;
  }

  /**
   * Open target window's dev tools
   * @param {Object} args
   * @param {Electron.Event} event
   */
  openDevToolsAction(args, event) {
    try {
      const window = WindowManager.getWindow(args.window);

      if (window) {
        if (window.webContents.isDevToolsOpened()) {
          window.webContents.closeDevTools();

          window.webContents.send(this.responseChannel('devToolsClosed'));
        } else {
          window.webContents.openDevTools();

          window.webContents.send(this.responseChannel('devToolsOpened'));
        }
      }
    } catch (e) {
      //
    }
  }

  sendStatus(message) {
    console.log(message);
    WindowManager.getWindow('app').webContents.send(
      this.responseChannel('status'),
      {
        statusMessage: message
      }
    )
  }
}

export default DebugService;
