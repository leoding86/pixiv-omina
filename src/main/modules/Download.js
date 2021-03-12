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
     * @property {number}
     */
    this.speed = 0;

    /**
     * @property {number}
     */
    this.progress = 0;

    /**
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
        let totalSize = 0;
        let completeSize = 0;

        if (response.headers['content-length']) {
          totalSize = Array.isArray(response.headers['content-length']) ?
            response.headers['content-length'][0] :
            response.headers['content-length'];
        }

        if (response.statusCode !== 200) {
          this.setError(Error(response.statusCode));
          return;
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

        let speedChunkDataLength = 0, duration = 0;

        let startTime = Date.now();

        let downloadTemporaryWriteStream = this.createDownloadTemporaryFileWriteStream(saveFile);

        response.pipe(downloadTemporaryWriteStream);

        response.on('data', data => {
          let nowTime = Date.now();

          completeSize += data.length;

          duration = nowTime - startTime;

          if (duration >= this.speedSensitivity) {
            this.speed = Math.floor(speedChunkDataLength * 1000 / duration);
            this.progress = (totalSize ? Math.floor(completeSize / totalSize * 100) : 0) / 100;

            this.setProgress();
          } else {
            speedChunkDataLength += data.length;
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

          this.progress = 1;

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

  setProgress() {
    this.emit('dl-progress');

    debug.sendStatus(`Download progress ${this.options.url}`)
  }

  setFinish() {
    this.progress = 1;

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
