import { net, ipcMain, session } from 'electron';
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

  /**
   * Check login state then response renderer
   */
  checkUserLoginedAction() {
    this.checkUserLogined().then(() => {
      WindowManager.getWindow('app').webContents.send(this.responseChannel('logined'));
    }).catch(error => {
      if (error && error.message) {
        console.log(error.message);
      }

      WindowManager.getWindow('app').webContents.send(this.responseChannel('not-login'));
    });
  }

  /**
   * @returns {Promise}
   */
  checkUserLogined() {
    return new Promise((resolve, reject) => {
      let url = UrlBuilder.getAccountUnreadCountUrl();

      let ses = session.fromPartition(ServiceContainer.getService('partition').getPartition('main', true));

      ses.cookies.get({
        url: 'https://www.pixiv.net/'
      }).then(cookies => {
        let cookieString = '';

        cookies.forEach(cookie => {
          cookieString += `${cookie.name}=${cookie.value}; `;
        });

        let requsetOptions = {
          method: 'GET',
          url: url,
          session: ses
        };

        console.log(requsetOptions);

        let request = net.request(requsetOptions);

        request.setHeader('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3964.0 Safari/537.36');
        request.setHeader('cookie', cookieString);

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
            console.log(jsonData)

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
    });
  }
}

export default UserService;
