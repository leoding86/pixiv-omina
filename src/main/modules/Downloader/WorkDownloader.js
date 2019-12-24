import path from 'path';
import EventEmitter from 'events';
import Request from '@/modules/Request';
import Download from '@/modules/Download';
import WindowManager from '@/modules/WindowManager';

/**
 * @class
 */
class WorkDownloader extends EventEmitter {
  /**
   * @constructor
   */
  constructor() {
    super();

    this.windowManager = WindowManager.getManager();

    /**
     * @type {Request}
     */
    this.request = null;

    /**
     * @type {Download}
     */
    this.download = null;

    /**
     * @type {string}
     */
    this.id = null;

    /**
     * @type {number}
     */
    this.progress = 0;

    /**
     * @type {Object|null}
     */
    this.context = null;

    /**
     * @type {WorkDownloader.state}
     */
    this.state = WorkDownloader.state.pending;

    /**
     * @type {string}
     */
    this.statusMessage = '';

    /**
     * @property {Object} options
     * @property {string} options.saveTo
     * @property {boolean} options.isUser
     */
    this.options = {
      isUser: false
    };

    /**
     * @type {string|number}
     */
    this.type = null;

    /**
     * @property {boolean}
     */
    this.saveInSubfolder = true;

    /**
     * the target used to open in explorer or finder
     * @property {String}
     */
    this.savedTarget = null;

    /**
     * when a downloader marked recycled, not events will fired
     * @property {Boolean}
     */
    this.recycle = false;
  }

  get speed() {
    if (this.download) {
      return this.download.speed;
    }

    return 0;
  }

  get title() {
    return this.id;
  }

  /**
   * @enum {string}
   */
  static state = {
    pending: 'pending',
    downloading: 'downloading',
    processing: 'processing',
    error: 'error',
    finish: 'finish',
    stopping: 'stopping',
    stop: 'stop'
  }

  /**
   * @param {Object} param
   * @param {number|string} param.workId
   * @param {Object} param.options
   * @returns {WorkDownloader}
   */
  static createDownloader({workId, options}) {
    throw Error('Abstract method, not implemented');
  }

  /**
   *
   */
  disableSaveInSubfolder() {
    this.saveInSubfolder = false;
  }

  enableSaveInSubfolder() {
    this.saveInSubfolder = true;
  }

  willRecycle() {
    this.recycle = true;
  }

  getImageSaveFolderName() {
    throw Error('Method getImageSaveFolderName is not implemented');
  }

  getImageSaveFolder() {
    return this.saveInSubfolder ?
      path.join(this.options.saveTo, this.getImageSaveFolderName()) :
      this.options.saveTo;
  }

  isUser() {
    return !!this.options.isUser;
  }

  setContext(context) {
    this.context = context;
  }

  setPending(message) {
    this.statusMessage = message || 'Pending';
    this.state = WorkDownloader.state.pending;
  }

  setStart(message) {
    this.statusMessage = message || 'Start';
    this.state = WorkDownloader.state.downloading;

    if (!this.recycle) {
      this.emit('start', { downloader: this });
    }
  }

  setDownloading(message) {
    this.statusMessage = message || 'Downloading';
    this.state = WorkDownloader.state.downloading;

    if (!this.recycle) {
      this.emit('progress', { downloader: this });
    }
  }

  setProcessing(message) {
    this.statusMessage = message || 'Processing';
    this.state = WorkDownloader.state.processing;

    if (!this.recycle) {
      this.emit('progress', { downloader: this });
    }
  }

  setStopping(message) {
    this.statusMessage = message || 'Stopping';
    this.state = WorkDownloader.state.stopping;

    if (!this.recycle) {
      this.emit('progress', { downloader: this });
    }
  }

  setStop(message) {
    this.statusMessage = message || 'Stopped';
    this.state = WorkDownloader.state.stop;

    if (!this.recycle) {
      this.emit('stop', { downloader: this });
    }
  }

  setFinish(message) {
    this.statusMessage = message || 'Finished';
    this.state = WorkDownloader.state.finish;

    this.request = null;
    this.download = null;

    this.progress = 1;

    if (!this.recycle) {
      this.emit('finish', { downloader: this });
    }
  }

  /**
   *
   * @param {Error} error
   */
  setError(error) {
    this.statusMessage = error.message;
    this.state = WorkDownloader.state.error;

    if (!this.recycle) {
      this.emit('error', { downloader: this });
    }
  }

  isPending() {
    return this.state === WorkDownloader.state.pending;
  }

  isDownloading() {
    return this.state === WorkDownloader.state.downloading;
  }

  isProcessing() {
    return this.state === WorkDownloader.state.processing;
  }

  isStopping() {
    return this.state === WorkDownloader.state.stopping;
  }

  isStop() {
    return this.state === WorkDownloader.state.stop;
  }

  reset() {
    this.progress = 0;
    this.state = WorkDownloader.state.pending;
    this.statusMessage = '';
  }

  start() {
    throw 'Not implemeneted';
  }

  stop() {
    if (this.isProcessing()) {
      return;
    }

    if (this.isStopping()) {
      return;
    }

    this.setStopping();

    if (this.download || this.request) {
      this.download && this.download.abort();
      this.request && this.request.abort();
    }

    this.setStop();
  }

  delete() {
    throw 'Not implemeneted';
  }

  toJSON() {
    let data = {
      id: this.id,
      title: this.title,
      state: this.state,
      speed: this.speed,
      progress: this.progress,
      statusMessage: this.statusMessage,
      type: this.type
    };

    return data;
  }
}

export default WorkDownloader;
