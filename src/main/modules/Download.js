import {
  app,
  net
} from 'electron';
import fs, { write } from 'fs';
import path from 'path';
import formatUrl from 'url';
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
    super(options);

    /**
     * @type {string}
     */
    this.saveDir = options.saveDir || app.getPath('downloads');

    /**
     * @type {number}
     */
    this.speed = 0;
  }
//
  /**
   *
   * @param {Object} options
   * @param {Object} [listener]
   */
  static download(options, listener) {
    let download = new Download(options);

    download.download();

    return download;
  }

  /**
   * @returns {string}
   */
  getFilename() {
    let filename = this.options.saveName;

    if (!filename) {
      let urlObj = formatUrl.parse(this.options.url);

      if (urlObj.pathname) {
        let parts = urlObj.pathname.split('/');

        if (parts.length > 0) {
          filename = parts[parts.length - 1];
        }
      }
    }

    filename = filename || ('file' + Date.now());
  }

  download() {
    /**
     * Parse file name
     */
    let filename = this.getFilename();

    this.on('response', response => {
      let startTime = Date.now();

      let writeStream = fs.createWriteStream(path.join(this.saveDir, filename));

      response.pipe(writeStream);

      response.on('data', data => {
        let nowTime = Date.now();
        let duration = nowTime - startTime;

        this.speed = data / Math.round(duration / 1000);

        this.emit('dl-progress');
      });

      response.on('end', () => {
        /**
         * Close write stream
         */
        writeStream.close();
        this.speed = 0;

        this.emit('dl-finish');
      });

      response.on('error', error => {
        writeStream.close();
        this.speed = 0;

        this.emit('dl-error', error);
      });

      response.on('aborted', () => {
        writeStream.close();
        this.speed = 0;

        this.emit('dl-aborted');
      });
    });

    this.on('error', error => {
      this.emit('dl-error', error);
    });

    this.on('abort', () => {
      this.emit('dl-aborted');
    });

    /**
     * Send request to start download
     */
    this.end();
  }
}

export default Download;
