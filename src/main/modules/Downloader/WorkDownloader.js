import EventEmitter from 'events';
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

  setPending() {
    this.state = WorkDownloader.state.pending;
  }

  setDownloading() {
    this.state = WorkDownloader.state.downloading;
  }

  setErrorStatus(errorMessage) {
    this.statusMessage = errorMessage;
    this.state = WorkDownloader.state.error;
  }

  isPending() {
    return this.state === WorkDownloader.state.pending;
  }

  isDownloading() {
    return this.state === WorkDownloader.state.downloading;
  }

  updateStatus(message) {
    this.statusMessage = message;
  }

  start() {
    throw 'Not implemeneted';
  }

  stop() {
    throw 'Not implemeneted';
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
