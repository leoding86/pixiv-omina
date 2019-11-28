import {
  ipcMain,
} from 'electron';
import {
  debug
} from '@/global';
import Request from '@/modules/Request';
import WindowManager from '@/modules/WindowManager';
import UrlBuilder from '@/../utils/UrlBuilder';
import BaseService from '@/services/BaseService';
import ServiceContainer from '@/ServiceContainer';

/**
 * @class
 */
class UserService extends BaseService {

  /**
   * @type {string}
   */
  static channel = 'user-service';

  /**
   * @constructor
   */
  constructor() {
    super();

    ipcMain.on(UserService.channel, this.channelIncomeHandler.bind(this));
  }

  /**
   * @returns {UserService}
   */
  static getService() {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }

    return UserService.instance;
  }

  /**
   * Get renderer response channel
   * @param {string} name
   */
  responseChannel(name) {
    return UserService.channel + `:${name}`;
  }

  /**
   * Open login window and after window closed then response renderer to check login state
   */
  userLoginAction() {
    let loginWindow = WindowManager.getManager().createWindow('login', {
      parent: WindowManager.getWindow('app'),
      modal: true,
      webPreferences: {
        nodeIntegration: true,
        webviewTag: true
      }
    });

    loginWindow.on('closed', event => {
      WindowManager.getWindow('app').webContents.send(this.responseChannel('check-login'));
    });
  }

  userLogoutAction() {
    ServiceContainer.getService('debug').sendStatus('Logout');

    let request = new Request({
      url: UrlBuilder.getUserLogoutUrl(),
      method: 'GET',
      redirect: "error"
    });

    request.on('error', () => {
      // prevent error popup
    });

    request.once('close', () => {
      WindowManager.getWindow('app').webContents.send(this.responseChannel('check-login'));
    });

    request.end();//
  }

  /**
   * Check login state then response renderer
   */
  checkUserLoginedAction() {
    debug.sendStatus('Checking login status');

    this.checkUserLogined().then(() => {
      WindowManager.getWindow('app').webContents.send(this.responseChannel('logined'));

      debug.sendStatus('Logined');
    }).catch(error => {
      if (error && error.message) {
        // console.log(error.message);
      }

      WindowManager.getWindow('app').webContents.send(this.responseChannel('not-login'));

      debug.sendStatus('Logouted');
    });
  }

  /**
   * @returns {Promise}
   */
  checkUserLogined() {
    return new Promise((resolve, reject) => {
      let url = UrlBuilder.getAccountUnreadCountUrl();

      let request = new Request({
        url: url
      });

      request.setHeader(
        'user-agent',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3964.0 Safari/537.36'
      );

      request.on('response', response => {
        let body = '';

        response.on('data', data => {
          body += data;
        });

        response.on('error', () => {
          reject('response error');
        });

        response.on('end', () => {
          let jsonData = JSON.parse(body);
          // console.log(jsonData)

          if (jsonData && jsonData.body && jsonData.body.unread_count) {
            resolve();
            return;
          }

          reject('cannot resolve response');
        });
      });

      request.on('error', error => {
        reject(error.message);
      });

      request.end();
    });
  }
}

export default UserService;
