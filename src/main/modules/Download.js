import EventEmitter from 'events';
import {
  app,
  net
} from 'electron';
import fs from 'fs';
import path from 'path';
import formatUrl from 'url';
import WindowManager from './WindowManager';
import Request from '@/modules/Request';

class Download extends Request {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} options.url
   * @param {string} [options.method]
   * @param {Electron.Session} [options.session]
   * @param {string} [options.partition]
   * @param {string} [options.saveDir]
   * @param {string} [options.saveName]
   */
  constructor(options) {
    this.options = options;

    /**
     * @type {string}
     */
    this.saveDir = this.options.saveDir || app.getPath('downloads');

    /**
     * Merge options
     */
    tthis.options = Object.assign({}, Download.globalOptions, this.options);

    super(this.options);
  }

  static globalOptions = {};

  static setGlobalOptions(options) {
    Download.globalOptions = options;
  }

  /**
   *
   * @param {Object} option
   * @param {Object} [listener]
   */
  static download(option, listener) {
    let download = new Download(option);

    download.download();

    return download;
  }

  /**
   * @returns {string}
   */
  getFilename() {
    let filename = this.options.saveName;

    if (!filename) {
      let urlObj = formatUrl.parse(this.url);

      if (urlObj.pathname) {
        let parts = urlObj.pathname.split('/');

        if (parts.length > 0) {
          filename = parts[parts.length - 1];
        }
      }
    }

    filename = filename || 'file';
  }

  download() {
    /**
     * Parse file name
     */
    let filename = this.getFilename();

    for (let name in headers) {
      this.request.setHeader(name, headers[name]);
    }

    this.on('response', response => {
      let writeStream = fs.createWriteStream(path.join(this.saveDir, filename));

      response.pipe(writeStream);

      response.on('end', () => {
        this.emit('finish');
      });
    });

    this.on('error', error => {
      Error(error.message);
    });

    this.on('abort', () => {
      this.emit('abort');
    });

    this.end();
  }
}

export default Download;
