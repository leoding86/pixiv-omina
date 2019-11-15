import { BrowserWindow } from 'electron'
import { format as formatUrl } from 'url'
import * as path from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

function WindowManager() {
  this.windows = {}
}

WindowManager.instance = null;

/**
 * @returns {WindowManager}
 */
WindowManager.getManager = function() {
  if (!WindowManager.instance) {
    WindowManager.instance = new WindowManager();
  }

  return WindowManager.instance;
}

WindowManager.prototype = {
  /**
   *
   * @param {string} name
   * @param {Electron.BrowserWindowConstructorOptions} args
   * @returns {Electron.BrowserWindow}
   */
  createWindow(name, args, loadUrlArgs = {}) {
    let window = new BrowserWindow(args)
    let url;

    if (isDevelopment) {
      window.webContents.openDevTools()
    }

    if (isDevelopment) {
      url = `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}?target=${name}`
    }
    else {
      url = formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
      }) + `?target=${name}`
    }

    window.loadURL(url, loadUrlArgs)

    this.appendWindow(name, window)

    return window
  },

  /**
   *
   * @param {string} name
   * @param {Electron.BrowserWindow} window
   */
  appendWindow(name, window) {
    this.windows[name] = window
  },

  /**
   *
   * @param {string} name
   * @returns {Electron.BrowserWindow}
   */
  getWindow(name) {
    if (!this.windows[name]) {
        throw `Cannot find window '${name}'`;
    }

    return this.windows[name];
  }
}

export default WindowManager
