import path, { extname } from 'path';

// import Request from '@/modules/Request';
import Request from '@/modules/Request';
import {
  debug
} from '@/global';
import formatUrl from 'url';
import fs from 'fs-extra';
import mime from 'mime-types';

/**
 * Notice that the dl-progress event is not triggered every time, review codes for detail.
 */
class Download extends Request {
  /**
   * @static
   * @type {string}
   */
  static tempExtenstionName = 'tpdownload';

  static duplicated = {
    skip: 'skip'
  };

  /**
   * Set download temporary name
   * @param {string} tempExtenstionName
   */
  setTempExtenstionName(tempExtenstionName) {
    Download.tempExtenstionName = tempExtenstionName;
  }

  /**
   * @constructor
   * @param {Object} options
   * @param {string} options.url
   * @param {string} [options.method]
   * @param {Electron.Session} [options.session]
   * @param {string} [options.partition]
   * @param {string} [options.saveTo]
   * @param {string} [options.saveName]
   */
  constructor(options) {
    super(options);

    /**
     * @property {string}
     */
    this.saveTo = options.saveTo;

    /**
     * @property {string}
     */
    this.saveName = options.saveName;

    /**
     * @property {string}
     */
    this.tempExtenstionName = Download.tempExtenstionName;

    /**
     * @property {string}
     */
    this.tempFile = '';

    /**
     * Milliseconds
     *
     * @property {number}
     */
    this.speedSensitivity = 100;

    /**
     * @property {number}
     */
    this.startTime = null;

    /**
     * @property {number}
     */
    this.endTime = null;

    /**
     * @property {null | number}
     */
    this.completeTime = null;

    /**
     * @property {string}
     */
    this.duplicateMode = Download.duplicated.skip;

    /**
     * @property {boolean}
     */
    this.skipped = false;

    /**
     * @property {Number}
     */
    this.escapedTime = 0;

    /**
     * @property {Number}
     */
    this.completedDataSize = 0;

    /**
     * @property {Number}
     */
    this.totalDataSize = 0;

    /**
     * @property {Boolean}
     */
    this.isFinished = false;
  }

  /**
   * @returns {Number}
   */
  get speed() {
    if (this.escapedTime > 0) {
      return this.completedDataSize / this.escapedTime * 1000;
    } else {
      return this.completedDataSize;
    }
  }

  /**
   * @returns {Number}
   */
  get progress() {
    if (this.isFinished) {
      return 1;
    } else if (this.totalDataSize > 0) {
      return this.completedDataSize / this.totalDataSize;
    } else {
      return 0;
    }
  }

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
   * @param {string} extName
   * @returns {string}
   */
  getFilename(extName) {
    let filename = this.saveName;

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

    let regexp;

    if (extName === 'jpg' || extName === 'jpeg') {
      regexp = RegExp('\.jpe?g$');
    } else {
      regexp = RegExp(`\.${extName}$`);
    }

    if (regexp.test(filename)) {
      return filename;
    }

    return `${filename}.${extName}`;
  }

  createDownloadTemporaryFileWriteStream(targetFilename) {
    this.tempFile = `${targetFilename}.${this.tempExtenstionName}`;
    return fs.createWriteStream(this.tempFile);
  }

  renameTemporaryFileToSaveFile(saveFile) {
    fs.renameSync(this.tempFile, saveFile);
  }

  preFetchExtname(url) {
    let matches = url.match(/\.([a-z]+)(?:\?.*)?$/);

    if (matches) {
      return matches[1];
    }
  }

  hasFileBeenDownloaded(file) {
    return fs.existsSync(file);
  }

  skip() {
    try {
      this.skipped = true;
      this.abort();
    } catch(e) {
      //ignore
    }
  }

  download() {
    debug.sendStatus(`Download ${this.options.url}`);

    /**
     * Create save folder
     */
    fs.ensureDir(this.saveTo).then(() => {
      this.startTime = Date.now();

      /**
       * Check if the file has been downloaded, this is the first checking using the pre-fetch file extension from url
       */
      let preFetchedExtName = this.preFetchExtname(this.options.url);

      if (preFetchedExtName) {
        this.saveName = this.getFilename(preFetchedExtName);

        if (this.hasFileBeenDownloaded(path.join(this.saveTo, this.saveName))) {
          if (this.duplicateMode === Download.duplicated.skip) {
            this.setFinish('Downloaded, skip');
            return;
          }
        }
      }

      this.on('response', response => {
        if (response.statusCode !== 200) {
          this.setError(Error(response.statusCode));
          return;
        }

        if (response.headers['content-length']) {
          this.totalDataSize = Array.isArray(response.headers['content-length'])
                      ? parseInt(response.headers['content-length'][0])
                      : parseInt(response.headers['content-length']);
        }

        const contentType = response.headers['content-type'];

        let extName = mime.extension(Array.isArray(contentType) ? contentType[0] : contentType);

        /**
         * Parse file name
         */
        this.saveName = this.getFilename(extName);

        let saveFile = path.join(this.saveTo, this.saveName);

        /**
         * Check if the file has been downloaded if can not fetch the file extension from url
         */
        if (this.hasFileBeenDownloaded(saveFile)) {
          if (this.duplicateMode === Download.duplicated.skip) {
            this.skip();
            return;
          }
        }

        let startTime = Date.now(),
            nowTime = 0,
            eventStartTime = 0,
            downloadTemporaryWriteStream = this.createDownloadTemporaryFileWriteStream(saveFile);

        response.pipe(downloadTemporaryWriteStream);

        response.on('data', data => {
          nowTime = Date.now();

          this.completedDataSize += data.length;

          this.escapedTime = nowTime - startTime;

          if (eventStartTime === 0 || (nowTime - eventStartTime) >= this.speedSensitivity) {
            this.setProgress();

            /**
             * Reset event start time
             */
            eventStartTime = Date.now();
          }
        });

        response.on('end', () => {
          /**
           * Close write stream
           */
          downloadTemporaryWriteStream.close();

          this.renameTemporaryFileToSaveFile(path.join(this.saveTo, this.saveName));

          this.endTime = Date.now();

          this.completeTime = this.endTime - this.startTime;

          /**
           * Waiting os REALLY write data to file
           */
          setTimeout(() => {
            this.setFinish();
          }, 1000);
        });

        response.on('error', error => {
          downloadTemporaryWriteStream.close();
          this.speed = 0;

          this.setError(error);
        });

        response.on('aborted', () => {
          if (this.skipped) {
            this.setFinish('Abort download because file has been downloaded');
            return;
          }

          downloadTemporaryWriteStream.close();
          this.speed = 0;

          this.setAbort();
        });
      });

      this.on('error', error => {
        this.setError(error);
      });

      this.on('abort', () => {
        if (this.skipped) {
          this.setFinish('Abort download because file has been downloaded');
          return;
        }

        this.setAbort();
      });

      /**
       * Send request to start download
       */
      this.end();
    }).catch(error => {
      this.setError(error);
    });
  }

  setStart() {
    this.emit('dl-begin');

    debug.sendStatus(`Download ${this.options.url} is begin`);
  }

  setProgress() {
    this.emit('dl-progress');

    debug.sendStatus(`Download progress ${this.options.url}`)
  }

  setFinish() {
    this.isFinished = true;

    this.emit('dl-finish', { file: path.join(this.saveTo, this.saveName) });

    debug.sendStatus(`Download ${this.options.url} finish`);
  }

  setError(error) {
    this.emit('dl-error', error);

    debug.sendStatus(`Download ${this.options.url} error`);
  }

  setAbort() {
    this.emit('dl-aborted');

    debug.sendStatus(`Download ${this.options.url} aborted`);
  }

  getSavedFile() {
    return path.join(this.saveTo, this.saveName);
  }
}

export default Download;
