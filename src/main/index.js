'use strict'

import { app, BrowserWindow, ipcMain, protocol } from 'electron'
import WindowManager from './modules/WindowManager'
import ServiceContainer from '@/ServiceContainer';
import Request from '@/modules/Request';

/**
 * Make sure there is only one instance will be created.
 */
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();

  // Throw a error
  Error("Only one instance could be created");
}

// const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

/**
 * Create window manager, you should use this create window
 */
const windowManager = WindowManager.getManager();

/**
 * If another instance has been created, active the first instance.
 */
app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.focus();
  }
});

function createMainWindow() {
  const window = windowManager.createWindow('app', {
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true
    }
  });

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
  window.webContents.session.webRequest.onBeforeSendHeaders((detail, cb) => {
    let { requestHeaders } = detail;

    console.log(requestHeaders);

    requestHeaders = Object.assign(requestHeaders, { Referer: 'https://www.pixiv.net/' });

    cb({ requestHeaders });
  }, {
    urls: ['*://*.pixiv.net/*', '*://*.pximg.net/*']
    // types: ['xmlhttprequest']
  });

  /**
   * Override the response headers
   */
  window.webContents.session.webRequest.onHeadersReceived({}, (detail, cb) => {
    if (detail.responseHeaders['x-frame-options'] || detail.responseHeaders['X-Frame-Options']) {
      delete detail.responseHeaders['x-frame-options'];
      delete detail.responseHeaders['X-Frame-Options'];
    }

    cb({
      cancel: false,
      responseHeaders: detail.responseHeaders,
      statusLine: detail.statusLine
    });
  });

  /**
   * After window has been created, then create services. Because some service depend on main window
   */
  ServiceContainer.getContainer();

  ServiceContainer.getService('partition').createPartition('main', true);

  /**
   * Set Request global options
   */
  Request.setGlobalOptions({
    partition: ServiceContainer.getService('partition').getPartition('main')
  });

  /**
   * Set WindowManager global partition
   */
  WindowManager.setGlobalPartition(ServiceContainer.getService('partition').getPartition('main', true));

  return window
}

app.on('open-url', (event, data) => {
  event.preventDefault();

  console.log(data);
});

app.setAsDefaultProtocolClient('pixiv-omina')

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow();
})
