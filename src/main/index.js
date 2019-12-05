import path from 'path';
import { app, shell, Tray, Menu, systemPreferences, nativeImage, session } from 'electron';
import UrlParser from '@/modules/UrlParser';
import Request from '@/modules/Request';
import ServiceContainer from '@/ServiceContainer';
import WindowManager from './modules/WindowManager';
import PartitionManager from '@/modules/PartitionManager';
import SettingStorage from '@/modules/SettingStorage';

console.log(`Electron version: ${process.versions['electron']}`);

// const isDevelopment = process.env.NODE_ENV !== 'production'//

/**
 * Make sure there is only one instance will be created.
 */
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  // const isDevelopment = process.env.NODE_ENV !== 'production'

  /**
   * global reference to mainWindow (necessary to prevent window from being garbage collected)
   * @type {Electron.BrowserWindow}
   */
  let mainWindow

  /**
   * @type {Electron.Tray}
   */
  let tray;

  /**
   * @type {Boolean}
   */
  let quiting;

  /**
   * Create partition manager and create a partition, you should use this to get the session
   */
  const partitionManager = PartitionManager.getManager();
  partitionManager.createPartition('main', true);

  /**
   * Create window manager, you should use this create window
   */
  const windowManager = WindowManager.getManager();

  /**
   * Set WindowManager global partition
   */
  WindowManager.setGlobalPartition(partitionManager.getPartition('main'));

  /**
   * If another instance has been created, active the first instance.
   * And it is used for open application with clicking url in windows.
   */
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    WindowManager.getWindow('app').webContents.send('debug:log', process.argv);
    WindowManager.getWindow('app').webContents.send('debug:log', event);
    WindowManager.getWindow('app').webContents.send('debug:log', commandLine);
    WindowManager.getWindow('app').webContents.send('debug:log', workingDirectory);

    commandLine.forEach(line => {
      if (/^pixiv-omina:/.test(line)) {
        const urlParts = new URL(line);
        const incomingUrl = decodeURIComponent(urlParts.searchParams.get('url'));

        const workId = UrlParser.getWorkIdFromUrl(incomingUrl);

        if (workId) {
          ServiceContainer.getService('download').createDownloadAction({
            workId,
            saveTo: SettingStorage.getSetting('saveTo')
          });
        }
      }
    });

    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }

      mainWindow.focus();
    }
  });

  function createMainWindow() {
    Menu.setApplicationMenu(null); // Fixed the browserWindow.removeMenu() not working

    /**
     * Override the request headers
     */
    partitionManager.getSession('main').webRequest.onBeforeSendHeaders({
      urls: ['*://*.pixiv.net/*', '*://*.pximg.net/*']
    }, (detail, cb) => {
      let { requestHeaders } = detail;

      requestHeaders = Object.assign(
        {},
        requestHeaders,
        {
          'user-agent': SettingStorage.getSetting('userAgent'),
          referer: 'https://www.pixiv.net/'
        }
      );

      console.log('REQUEST HEADERS');
      console.log(`REQUEST URL: ${detail.url}`);
      console.table(requestHeaders);

      cb({ requestHeaders });
    });

    /**
     * Override the response headers used for load iframe page
     */
    partitionManager.getSession('main').webRequest.onHeadersReceived({
      urls: ['*://*.pixiv.net/*', '*://*.pximg.net/*']
    }, (detail, cb) => {
      if (detail.responseHeaders['x-frame-options'] || detail.responseHeaders['X-Frame-Options']) {
        delete detail.responseHeaders['x-frame-options'];
        delete detail.responseHeaders['X-Frame-Options'];
      }

      console.log(`RESPONSE BY URL: ${detail.url}`)
      console.log('RESPONSE HEADERS');
      console.table(detail.responseHeaders);

      cb({
        responseHeaders: detail.responseHeaders
      });
    });

    const window = windowManager.createWindow('app', {
      width: 800,
      height: 600,
      minWidth: 600,
      minHeight: 400,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true
      }
    });

    window.removeMenu();

    window.on('closed', () => {
      mainWindow = null
    })

    window.webContents.on('devtools-opened', () => {
      window.focus()
      setImmediate(() => {
        window.focus()
      })
    });

    /**
     * After window has been created, then create services. Some services depend on main window,
     * Because services are designed for communicating with the windows
     */
    ServiceContainer.getContainer();

    /**
     * Set Request global options
     */
    Request.setGlobalOptions({
      session: partitionManager.getSession('main'),
      headers: {
        'user-agent': SettingStorage.getSetting('userAgent'),
        'referer': 'https://www.pixiv.net/'
      }
    });

    /**
     * update proxy
     */
    function updateProxy() {
      const settings = SettingStorage.getSettings();

      if (settings['enableProxy'] && settings['proxyService'] && settings['proxyServicePort']) {
        partitionManager.getSession('main').setProxy({
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
        partitionManager.getSession('main').setProxy({
          pacScript: '',
          proxyRules: 'direct://',
          proxyBypassRules: ''
        }).then(() => {
          // ignore
        });

        Request.removeGlobalOptions(['proxyUsername', 'proxyPassword']);
      }
    }

    updateProxy();

    SettingStorage.getStorage().on('change', () => {
      updateProxy();
    });

    /**
     * Force external links from browser-window to open in a default browser from app
     */
    WindowManager.getWindow('app').webContents.on('new-window', (event, url) => {//
      event.preventDefault();

      shell.openExternal(url);
    });

    /**
     * This is for macOS
     */
    app.on('open-url', (event, url) => {
      event.preventDefault();

      const urlParts = new URL(url);

      const incomingUrl = decodeURIComponent(urlParts.searchParams.get('url'));

      const workId = UrlParser.getWorkIdFromUrl(incomingUrl);

      if (workId) {
        ServiceContainer.getService('download').createDownloadAction({
          workId,
          saveTo: SettingStorage.getSetting('saveTo')
        });
      }

      console.log(data);
    });

    return window
  }

  app.setAsDefaultProtocolClient('pixiv-omina')

  // quit application when all windows are closed
  app.on('window-all-closed', () => {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (process.platform !== 'darwin') {
      app.quit()
    }
  });

  app.on('activate', () => {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (mainWindow === null) {
      app.removeAllListeners('open-url');

      mainWindow = createMainWindow();
    } else {
      mainWindow.show();
    }
  });//

  app.on('will-quit', event => {
    quiting = true;
  });

  app.on('before-quit', event => {
    quiting = true;
  });

  // create main BrowserWindow when electron is ready
  app.on('ready', () => {
    console.log('ready');

    mainWindow = createMainWindow();

    // create the tray
    tray = new Tray(getTrayImage());

    tray.on('double-click', event => {
      mainWindow.show();
    });

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Quit',
        click: (menuItem, browserWindow, event) => {
          quiting = true;
          app.quit(); // app quit will trigger windows close event, because quiting signal is true, then app quit.
        }
      }
    ]);

    tray.setToolTip('Pixiv Omina');
    tray.setContextMenu(contextMenu);

    // Control main window close to tray
    mainWindow.on('close', event => {
      if (!quiting) {
        event.preventDefault();
        event.returnValue = false;
        event.sender.hide();

        return;
      }

      // Clear app cache
      partitionManager.getSession('main').clearCache();
    });
  });

  if (process.platform === 'darwin') {
    systemPreferences.subscribeNotification(
      'AppleInterfaceThemeChangedNotification',
      () => {
        tray.setImage(getTrayImage());
      }
    );
  }

  function getStatic(file) {
    if (app.isPackaged) {
      return path.join(process.resourcesPath, 'static', file);
    } else {
      return path.join(__static, file);
    }
  }

  function getTrayImage() {
    if (process.platform === 'darwin') {
      if (!systemPreferences.isDarkMode()) {
        return nativeImage.createFromPath(getStatic('tray-in-light.png'));
      }
    }

    return nativeImage.createFromPath(getStatic('tray-in-dark.png'));
  }
}
