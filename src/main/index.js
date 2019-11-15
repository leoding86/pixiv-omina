'use strict'

import { app, BrowserWindow, ipcMain, protocol } from 'electron'
import ListenersRegister from './ListenersRegister'
import WindowManager from './modules/WindowManager'
import MangaWorkDownloader from './modules/WorkDownloader/MangaWorkDownloader';
import Downloader from './modules/Downloader';

/**
 * Make sure there is only one instance will be created.
 */
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  /**
   * Create window manager, you should use this create window
   */
  const windowManager = WindowManager.getManager();

  /**
   * Configurate downloader
   */
  Downloader.setGlobalHeaders({
    'referer':    'https://www.pixiv.net/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3964.0 Safari/537.36',
  });

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

  // const isDevelopment = process.env.NODE_ENV !== 'production'

  // global reference to mainWindow (necessary to prevent window from being garbage collected)
  let mainWindow

  function createMainWindow() {
    const window = windowManager.createWindow('app', {
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false
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

    window.webContents.session.webRequest.onBeforeSendHeaders((detail, cb) => {
      let {requestHeaders} = detail;
      requestHeaders = Object.assign(requestHeaders, {Referer: 'https://www.pixiv.net/'});
      cb({requestHeaders});
    }, {
      urls: ['<all_urls>'],
      types: ['xmlhttprequest']
    });

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

    new ListenersRegister();

    // test
    ipcMain.on('work:download', (event, args) => {
      let downloader = MangaWorkDownloader.createDownloader();
    });
  })

}
