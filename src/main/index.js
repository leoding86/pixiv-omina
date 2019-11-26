'use strict'//

import formatUrl from 'url';
import { app, shell, ipcMain } from 'electron';
import Request from '@/modules/Request';
import ServiceContainer from '@/ServiceContainer';
import WindowManager from './modules/WindowManager';
import PartitionManager from '@/modules/PartitionManager';
import SettingStorage from '@/modules/SettingStorage';

const isDevelopment = process.env.NODE_ENV !== 'production'

/**
 * Make sure there is only one instance will be created.
 */
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();//

  // Throw a error
  Error("Only one instance could be created");
} else {
  // const isDevelopment = process.env.NODE_ENV !== 'production'

  // global reference to mainWindow (necessary to prevent window from being garbage collected)
  let mainWindow

  /**
   * Create window manager, you should use this create window
   */
  const windowManager = WindowManager.getManager();

  /**
   * Create partition manager and create a partition, you should use this to get the session
   */
  const partitionManager = PartitionManager.getManager();
  partitionManager.createPartition('main', true);

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
        const id = urlParts.searchParams.get('id');

        if (id) {
          ServiceContainer.getService('download').createDownloadAction({
            workId: id,
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
    const window = windowManager.createWindow('app', {
      width: 600,
      height: isDevelopment ? 1050 : 400,
      minWidth: 600,
      minHeight: 400,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true
      }
    });

    window.setMenu(null);

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
     * Override the request headers
     */
    partitionManager.getSession('main').webRequest.onBeforeSendHeaders({
      urls: ['*://*.pixiv.net/*', '*://*.pximg.net/*']
    }, (detail, cb) => {
      let { requestHeaders } = detail;

      requestHeaders = Object.assign(
        requestHeaders,
        {
          'user-agent': SettingStorage.getSetting('userAgent'),
          Referer: 'https://www.pixiv.net/'
        }
      );

      console.log('REQUEST HEADERS')
      console.table(requestHeaders);

      cb({ requestHeaders });
    });

    /**
     * Override the response headers used for load iframe page
     */
    partitionManager.getSession('main').webRequest.onHeadersReceived({}, (detail, cb) => {
      if (detail.responseHeaders['x-frame-options'] || detail.responseHeaders['X-Frame-Options']) {
        delete detail.responseHeaders['x-frame-options'];
        delete detail.responseHeaders['X-Frame-Options'];
      }

      console.log('RESPONSE HEADERS');
      console.table(detail.responseHeaders);

      cb({
        cancel: false,
        responseHeaders: detail.responseHeaders,
        statusLine: detail.statusLine
      });
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
      partition: partitionManager.getPartition('main'),
      headers: {
        'user-agent': SettingStorage.getSetting('userAgent'),
      }
    });

    /**
     * Set WindowManager global partition
     */
    WindowManager.setGlobalPartition(partitionManager.getPartition('main'));

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
      const id = urlParts.searchParams.get('id');

      if (id) {
        ServiceContainer.getService('download').createDownloadAction({
          workId: id,
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
    }
  });

  // create main BrowserWindow when electron is ready
  app.on('ready', () => {
    partitionManager.getSession('main').clearCache(() => {
      mainWindow = createMainWindow();
    });
  });
}
