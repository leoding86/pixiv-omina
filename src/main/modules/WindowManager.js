import { app, BrowserWindow } from 'electron';
import { format as formatUrl } from 'url';
import * as path from 'path';
import fs from 'fs-extra';

const isDevelopment = process.env.NODE_ENV !== 'production'

class WindowManager {
  constructor() {
    this.windows = {};
    this.windowResizeTimeouts = {};
    this.cacheFile = path.join(app.getPath('userData'), '.windows');
    this.initialCacheFile();
  }

  static globalPartition = null;

  /**
   * @type {WindowManager}
   */
  static instance;

  static setGlobalPartition = function(partition) {
    WindowManager.globalPartition = partition;
  }

  /**
   * @returns {WindowManager}
   */
  static getManager() {
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager();
    }

    return WindowManager.instance;
  }

  /**
   * alias for getManager
   * @returns {WindowManager}
   */
  static getDefault() {
    return WindowManager.getManager();
  }

  /**
   * @param {string} name
   * @returns {Electron.BrowserWindow}
   */
  static getWindow(name) {
    if (!WindowManager.instance) {
      Error('WindowManager has not been initialized');
    }

    return WindowManager.instance.getWindow(name);
  }

  /**
   * @returns {void}
   */
  initialCacheFile() {
    if (!fs.existsSync(this.cacheFile)) {
      fs.writeJSONSync(this.cacheFile, {});
    } else {
      try {
        fs.readJSONSync(this.cacheFile);
      } catch(e) {
        fs.writeJSONSync(this.cacheFile, {});
      }
    }
  }

  /**
   *
   * @param {string} name
   * @param {Electron.BrowserWindowConstructorOptions} args
   * @returns {Electron.BrowserWindow}
   */
  createWindow(name, args, loadUrlArgs = {}) {
    if (WindowManager.globalPartition) {
      args.webPreferences.partition = WindowManager.globalPartition;
    }

    let window = new BrowserWindow(args);
    let url;

    this.appendWindow(name, window);

    this.restoreWindowBounds(name);

    window.on('resize', () => {
      this.cacheWindowBounds(name);
    });

    window.on('move', () => {
      this.cacheWindowBounds(name);
    });

    window.on('close', () => {
      this.removeWindow(name);
    });

    if (isDevelopment) {
      url = `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}?target=${name}`
      window.webContents.openDevTools()
    }
    else {
      url = formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
      }) + `?target=${name}`
    }

    window.loadURL(url, loadUrlArgs)

    return window
  }

  /**
   *
   * @param {string} name
   * @param {Electron.BrowserWindow} window
   */
  appendWindow(name, window) {
    this.windows[name] = window;
    this.windowResizeTimeouts[name] = null;
  }

  /**
   *
   * @param {string} name
   */
  removeWindow(name) {
    this.windows[name] = null;
  }

  /**
   *
   * @param {string} name
   * @returns {Electron.BrowserWindow}
   */
  getWindow(name) {
    if (!this.windows[name]) {
        throw Error(`Cannot find window '${name}'`);
    }

    return this.windows[name];
  }

  /**
   *
   * @param {String} name Window name
   */
  getWindowResizeTimeout(name) {
    return this.windowResizeTimeouts[name];
  }

  /**
   *
   * @param {String} name
   * @param {Function} callback
   * @param {Number} timeout
   */
  setWindowResizeTimeout(name, callback, timeout) {
    this.windowResizeTimeouts[name] = setTimeout(callback.bind(this), timeout);
  }

  /**
   *
   * @param {String} name Window name
   */
  cacheWindowBounds(name) {
    let timeout = this.getWindowResizeTimeout(name);

    if (timeout) {
      clearTimeout(timeout);
    }

    this.setWindowResizeTimeout(name, () => {
      let cache = fs.readJSONSync(this.cacheFile);
      try {
        let window = this.getWindow(name);

        if (window) {
          if (!cache[name]) {
            cache[name] = {};
          }

          cache[name] = {
            isMaximized: window.isMaximized(),
            bounds: window.getBounds()
          }

          fs.writeJSONSync(this.cacheFile, cache);
        }
      } catch (e) {
        // do nothing
      }
    }, 1500);
  }

  /**
   *
   * @param {String} name Window name
   */
  restoreWindowBounds(name) {
    let window = this.getWindow(name);
    let cache = fs.readJSONSync(this.cacheFile);

    if (cache[name]) {
      if (cache[name].isMaximized) {
        window.maximize();
      } else if (cache[name].bounds) {
        window.setBounds(cache[name].bounds);
      }
    }
  }
}

export default WindowManager
