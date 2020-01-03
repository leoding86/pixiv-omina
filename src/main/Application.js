import path from 'path';
import { app, shell, Tray, Menu, systemPreferences, nativeImage } from 'electron';
import ServiceContainer from '@/ServiceContainer';
import Request from '@/modules/Request';
import SettingStorage from '@/modules/SettingStorage';
import NotificationManager from '@/modules/NotificationManager';
import PartitionManager from '@/modules/PartitionManager';
import WindowManager from '@/modules/WindowManager';

class Application {
  constructor() {
    if (this.quitIfNotSingleInstance()) {
      return;
    } else {
      this.mainWindow = null;

      this.tray = null;

      this.quiting = false;

      this.settingStorage = SettingStorage.getDefault();

      this.partitionManager = PartitionManager.getDefault();

      this.windowManager = WindowManager.getDefault();

      this.notificationManager = NotificationManager.getDefault();

      // create partition 'main'
      this.partitionManager.createPartition('main', true);

      // set WindowManager global partition
      WindowManager.setGlobalPartition(this.partitionManager.getPartition('main'));

      // listen setting changes
      SettingStorage.getDefault().on('change', this.onSettingChange.bind(this));

      // fixed the browserWindow.removeMenu() is not working
      Menu.setApplicationMenu(null);
    }
  }

  /**
   * @returns {Boolean}
   */
  quitIfNotSingleInstance() {
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      app.quit();
      return true;
    } else {
      return false;
    }
  }

  /**
   * Override the request headers when visit pixiv.net and pximg.net
   * @returns {void}
   */
  overrideRequestHeaders() {//
    this.partitionManager.getSession('main').webRequest.onBeforeSendHeaders(
      {
        urls: [
          '*://*.pixiv.net/*',
          '*://*.pximg.net/*'
        ]
      },
      (detail, cb) => {
        let { requestHeaders } = detail;

        requestHeaders = Object.assign(
          {},
          requestHeaders,
          {
            'user-agent': SettingStorage.getSetting('userAgent'),
            referer: 'https://www.pixiv.net/'
          }
        );

        cb({ requestHeaders });
      }
    )
  }

  /**
   * Override the response headers used for load iframe page
   * @returns {void}
   */
  overrideReceviedHeaders() {
    this.partitionManager.getSession('main').webRequest.onHeadersReceived(
      {
        urls: ['*://*.pixiv.net/*', '*://*.pximg.net/*']
      },
      (detail, cb) => {
        if (detail.responseHeaders['x-frame-options'] || detail.responseHeaders['X-Frame-Options']) {
          delete detail.responseHeaders['x-frame-options'];
          delete detail.responseHeaders['X-Frame-Options'];
        }

        // console.log(`RESPONSE BY URL: ${detail.url}`)
        // console.log('RESPONSE HEADERS');
        // console.table(detail.responseHeaders);

        cb({
          responseHeaders: detail.responseHeaders
        });
      }
    );
  }

  applySettings() {
    const settings = this.settingStorage.getSettings();

    if (settings['enableProxy'] && settings['proxyService'] && settings['proxyServicePort']) {
      this.partitionManager.getSession('main').setProxy({
        pacScript: '',
        proxyRules: settings['proxyService'] + ':' + settings['proxyServicePort'],
        proxyBypassRules: ''
      }).then(() => {
        //ignore
      });

      if (settings['enableProxyAuth']) {
        Request.updateGlobalOptions({
          authUsername: settings['proxyUsername'],
          authPassword: settings['proxyPassword']
        });
      }
    } else {
      this.partitionManager.getSession('main').setProxy({
        pacScript: '',
        proxyRules: 'direct://',
        proxyBypassRules: ''
      }).then(() => {
        // ignore
      });

      Request.removeGlobalOptions(['proxyUsername', 'proxyPassword']);
    }

    if (settings['showNotification']) {
      this.notificationManager.enableNotification();
    } else {
      this.notificationManager.disableNotification();
    }
  }

  /**
   * @param {String} asset
   * @returns {String}
   */
  getStatic(asset) {
    if (app.isPackaged) {
      return path.join(process.resourcesPath, 'static', asset);
    } else {
      return path.join(__static, asset);
    }
  }

  /**
   * @returns {Electron.NativeImage}
   */
  getTrayImage() {
    if (process.platform === 'darwin') {
      if (!systemPreferences.isDarkMode()) {
        return nativeImage.createFromPath(this.getStatic('tray-in-light.png'));
      }
    } else {
      return nativeImage.createFromPath(this.getStatic('tray-in-dark.png'));
    }
  }

  createMainWindow() {
    this.mainWindow = this.windowManager.createWindow('app', {
      width: 800,
      height: 600,
      minWidth: 600,
      minHeight: 400,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true
      }
    });

    this.mainWindow.removeMenu();

    this.mainWindow.webContents.on('new-window', (event, url) => {
      event.preventDefault();

      shell.openExternal(url);
    });
  }

  createTray() {
    this.tray = new Tray(this.getTrayImage());
    this.tray.setToolTip('Pixiv Omina');
    this.tray.setContextMenu(Menu.buildFromTemplate([
      {
        label: 'Quit',
        click: (menuItem, browserWindow, event) => {
          this.quiting = true;

           // app quit will trigger windows close event, because quiting signal is true,
           // so the app quit.
          app.quit();
        }
      }
    ]));

    this.tray.on('double-click', event => {
      this.mainWindow.show();
    });
  }

  updateTray() {
    //
  }

  onSettingChange() {
    this.applySettings();
  }

  onReady() {
    // set Request global options
    Request.setGlobalOptions({
      session: this.partitionManager.getSession('main'),
      headers: {
        'user-agent': SettingStorage.getSettings('userAgent'),
        'referer': 'https://www.pixiv.net/'
      }
    });

    this.overrideRequestHeaders();

    this.overrideReceviedHeaders();

    this.applySettings();

    this.createTray();

    this.createMainWindow();

    this.mainWindow.on('close', event => {
      if (this.quiting) {
        this.partitionManager.getSession('main').clearCache();
      } else if (SettingStorage.getSettings('closeToTray')) {
        event.preventDefault();
        event.returnValue = false;
        event.sender.hide();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    this.mainWindow.webContents.on('devtools-opened', () => {
      setImmediate(() => {
        this.mainWindow.focus();
      });
    });

    if (process.platform === 'darwin') {
      systemPreferences.subscribeLocalNotification(
        'AppleInterfaceThemeChangedNotification',
        () => {
          this.tray.setImage(this.getTrayImage());
        }
      );
    }

    /**
     * After window has been created, then create services. Some services depend on main window,
     * Because services are designed for communicating with the windows
     */
    ServiceContainer.getContainer();
  }

  onActivate() {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (this.mainWindow === null) {
      app.removeAllListeners('open-url');

      this.createMainWindow();
    } else {
      this.mainWindow.show();
    }
  }

  onSecondInstance(event, commandLine, workingDirectory) {
    WindowManager.getWindow('app').webContents.send('debug:log', process.argv);
    WindowManager.getWindow('app').webContents.send('debug:log', event);
    WindowManager.getWindow('app').webContents.send('debug:log', commandLine);
    WindowManager.getWindow('app').webContents.send('debug:log', workingDirectory);

    commandLine.forEach(line => {
      if (/^pixiv-omina:/.test(line)) {
        ServiceContainer.getService('debug').sendStatus(`Get line data: ${line}`);

        const urlParts = new URL(line);
        const incomingUrl = decodeURIComponent(urlParts.searchParams.get('url'));

        ServiceContainer.getService('download').createDownloadAction({
          url: incomingUrl,
          saveTo: SettingStorage.getSetting('saveTo')
        });
      }
    });

    if (this.mainWindow !== null) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }

      this.mainWindow.focus();
    }
  }

  onOpenUrl(event, url) {
    ServiceContainer.getService('debug').sendStatus(`Get url data: ${url}`);

    event.preventDefault();

    const urlParts = new URL(url);

    const incomingUrl = decodeURIComponent(urlParts.searchParams.get('url'));

    ServiceContainer.getService('download').createDownloadAction({
      url: incomingUrl,
      saveTo: SettingStorage.getSetting('saveTo')
    });

    console.log(data);
  }

  onWindowAllClosed() {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  onWillQuit(event) {
    this.quiting = true;
  }

  onBeforeQuit(event) {
    this.quiting = true;
  }
}

export default Application;
