import EventEmitter from 'events';
import {
  app,
  net
} from 'electron';
import fs from 'fs';
import path from 'path';
import formatUrl from 'url';
import WindowManager from './WindowManager';

class Download extends EventEmitter {
  constructor(url, options) {
    super();

    /**
     * @type {WindowManager}
     */
    this.windowManager = WindowManager.getManager();

    /**
     * @type {string}
     */
    this.url = url;

    /**
     * @type {object}
     */
    this.options = options || {};

    /**
     * @type {Electron.ClientRequest}
     */
    this.request = null;

    /**
     * @type {string}
     */
    this.saveDir = app.getPath('downloads');
  }

  static globalHeaders = {};

  static setGlobalHeaders(headers) {
    Download.globalHeaders = headers;
  }

  static download(url, options, listeners = {}) {
    let download = new Download(url, options);

    download.download();

    return download;
  }

  /**
   * @returns {string}
   */
  getFilename() {
    let filename = this.options.filename;

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
     * Init ClientRequest options
     */
    let clientRequestOptions = this.options.clientRequestOptions || {};

    clientRequestOptions.url = this.url;

    /**
     * Create clientRequest instance
     */
    this.request = net.request(clientRequestOptions);

    /**
     * Set headers
     */
    let headers = Downloader.globalHeaders || {};

    if (this.options.headers) {
      for (let name in this.options.headers) {
        headers[name] = this.options.headers[name];
      }
    }

    /**
     * Parse file name
     */
    let filename = this.getFilename();

    for (let name in headers) {
      this.request.setHeader(name, headers[name]);
    }

    this.request.on('response', response => {
      let writeStream = fs.createWriteStream(path.join(this.saveDir, filename));

      response.pipe(writeStream);

      response.on('end', () => {
        //
      });
    });

    this.request.on('error', error => {
      Error(error.message);
    });

    this.request.on('abort', () => {
      this.emit('abort');
    });

    this.request.end();
  }

  abort() {
    this.request.abort();
  }
}

export default Download;
