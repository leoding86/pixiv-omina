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
     * @type {Object}
     */
    this.options = {};

    /**
     * @type {string|number}
     */
    this.type = null;
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
    error: 'error',
    finish: 'finish',
    stop: 'stop'
  }

  /**
   * @param {Object} param
   * @param {number|string} param.workId
   * @param {Object} options
   * @returns {WorkDownloader}
   */
  static createDownloader({workId, options}) {
    let downloader = new this();

    downloader.id = workId;
    downloader.options = options;

    return downloader;
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

    this.emit('start', { downloader: this });
  }

  setDownloading(message) {
    this.statusMessage = message || 'Downloading';
    this.state = WorkDownloader.state.downloading;

    this.emit('progress', { downloader: this });
  }

  setStop(message) {
    this.statusMessage = message || 'Stopped';
    this.state = WorkDownloader.state.stop;

    this.emit('stop', { downloader: this });
  }

  setFinish() {
    this.statusMessage = 'Finished';
    this.statusMessage = WorkDownloader.state.finish;

    this.emit('finish', { downloader: this });
  }

  /**
   *
   * @param {Error} error
   */
  setError(error) {
    this.statusMessage = error.message;
    this.state = WorkDownloader.state.error;

    this.emit('error', { downloader: this });
  }

  isPending() {
    return this.state === WorkDownloader.state.pending;
  }

  isDownloading() {
    return this.state === WorkDownloader.state.downloading;
  }

  start() {
    throw 'Not implemeneted';
  }

  stop() {
    if (this.download) {
      this.download.abort();
    }

    if (this.request) {
      this.request.abort();
    }
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
      type: this.type//
    };

    return data;
  }
}

export default WorkDownloader;
