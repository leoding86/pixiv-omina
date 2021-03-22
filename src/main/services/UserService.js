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
import { parse } from 'node-html-parser';

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

  closeLoginAction(args, event) {
    const window = WindowManager.getWindow('login');

    if (window) {
      window.close();
    }
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
      this.checkUserLoginAction();
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
      this.checkUserLoginAction();
    });

    request.end();//
  }

  /**
   * Check login state then response renderer
   */
  checkUserLoginAction() {
    debug.sendStatus('Checking login status');

    this.checkUserLogin().then(() => {
      WindowManager.getWindow('app').webContents.send(
        this.responseChannel('check-login'), true
      );

      debug.sendStatus('Logined');
    }).catch(error => {
      WindowManager.getWindow('app').webContents.send(
        this.responseChannel('check-login'), false, error && error.name
      );

      debug.sendStatus('Not login');
    });
  }

  /**
   * @returns {Promise}
   */
  getBookmarkInfoAction({ rest = 'show' }) {
    return new Promise((resolve, reject) => {
      let url = UrlBuilder.getBookmarkUrl({ rest });

      let request = new Request({
        url: url
      });

      request.on('response', response => {
        let body = '';

        response.on('data', data => {
          body += data;
        });

        response.on('error', () => {
          WindowManager.getWindow('app').webContents.send(this.responseChannel('bookmark-info-error'));
          reject('response error');
        });

        response.on('end', () => {
          const doc = parse(body);
          let $pageList = doc.querySelector('.page-list'),
              $pages = $pageList.querySelectorAll('li'),
              len = ($pages && $pages.length > 0) ? $pages.length : 1,
              data = { pages: len };

          WindowManager.getWindow('app').webContents.send(this.responseChannel('bookmark-info'), data);
          resolve(data);
        });
      });

      request.on('error', error => {
        WindowManager.getWindow('app').webContents.send(this.responseChannel('bookmark-info-error'));
        reject(error.message);
      });

      request.end();
    });
  }

  /**
   * @returns {Promise}
   */
  checkUserLogin() {
    return new Promise((resolve, reject) => {
      let url = UrlBuilder.getAccountUnreadCountUrl();

      let request = new Request({
        url: url
      });

      request.on('response', response => {
        let body = '';

        response.on('data', data => {
          body += data;
        });

        response.on('error',error => {
          reject({
            name: 'ResponseError',
            message: error.message
          });
        });

        response.on('end', () => {
          let jsonData = JSON.parse(body);

          if (jsonData && jsonData.body && jsonData.body.unread_count) {
            resolve();
            return;
          }

          reject({
            name: 'InvalidResponseError'
          });
        });
      });

      request.on('error', error => {
        reject({
          name: 'RequestError',
          message: error.message
        });
      });

      request.end();
    });
  }
}

export default UserService;
