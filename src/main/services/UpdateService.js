import {
  ipcMain
} from 'electron';
import {
  debug
} from '@/global';
import BaseService from './BaseService';
import Request from '@/modules/Request';
import {
  VersionComparer
} from '@/../utils';
import WindowManager from '@/modules/WindowManager';
import packageInfo from '@/../../package.json';

class UpdateService extends BaseService {
  /**
   * @property
   * @type {DebugService}
   */
  static instance;

  /**
   * @property
   * @type {string}
   */
  static channel = 'update-service';

  constructor() {
    super();

    this.packageInfo = packageInfo;

    this.request = undefined;

    ipcMain.on(UpdateService.channel, this.channelIncomeHandler.bind(this));
  }

  /**
   * @returns {UpdateService}
   */
  static getService() {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService();
    }

    return UpdateService.instance;
  }

  /**
   * Get renderer response channel
   * @param {string} name
   */
  responseChannel(name) {
    return UpdateService.channel + `:${name}`;
  }

  checkUpdateAction() {
    const isDevelopment = process.env.NODE_ENV !== 'production'

    const checkUpdateUrl = isDevelopment ? 'http://127.0.0.1/package.php' : this.packageInfo.checkUpdateUrl;

    if (checkUpdateUrl) {
      if (!this.request) {
        this.request = new Request({
          url: checkUpdateUrl,
          method: 'GET'
        });

        this.request.on('response', response => {
          let body = '';

          response.on('data', data => {
            body += data;
          });

          response.on('end', () => {
            try {
              let jsonData = JSON.parse(body);

              if (jsonData && jsonData.version) {
                if (VersionComparer.compareVersion(jsonData.version, this.packageInfo.version) > 0) {
                  this.sendDataToWindow(
                    this.responseChannel('find-new-version'),
                    jsonData.version
                  );
                }
              }
            } catch (error) {
              debug.sendStatus('Check update error');
            }
          });

          response.on('error', error => {
            debug.sendStatus('Check update fail');
          });

          response.on('aborted', () => {
            debug.sendStatus('Check update aborted');
          });
        });

        this.request.on('error', error => {
          debug.sendStatus('Check update fail');
        });

        this.request.on('close', () => {
          this.request = null;
          this.sendDataToWindow(this.responseChannel('complete'));
        });

        this.request.end();
      }

      debug.sendStatus('Checking update');
    } else {
      debug.sendStatus('Cannot get update check url');
    }
  }
}

export default UpdateService;
