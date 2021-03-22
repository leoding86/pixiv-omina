import {
  ipcMain
} from 'electron';
import BaseService from './BaseService';
import WindowManager from '@/modules/WindowManager';
import fs from 'fs-extra';
import path from 'path';
import GetPath from '@/modules/Utils/GetPath';
import moment from 'moment';

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

    this.logFile = path.join(GetPath.userData(), 'app.log');
    fs.ensureFileSync(this.logFile);

    /**
     * Clear logs of previous runs
     */
    fs.writeFile(this.logFile, '');

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

  sendStatus(message, log = false) {
    if (log) {
      this.log(message);
    }

    WindowManager.getWindow('app').webContents.send(
      this.responseChannel('status'),
      {
        statusMessage: message
      }
    )
  }

  sendNotice(message) {
    this.sendDataToWindow(this.responseChannel('notice'), {
      notice: message
    });
  }

  log(message) {
    let log = '';

    if (message instanceof Error) {
      log = message.stack;
    } else if (typeof message === 'object') {
      log = (() => {
        let row = [];

        Object.keys(message).forEach(key => {
          row.push(`${key} -> ${message[key]}`);
        });

        return row.join(' | ');
      })();
    } else {
      log = message;
    }

    fs.appendFileSync(this.logFile, '[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']' + log + "\r\n");
  }
}

export default DebugService;
