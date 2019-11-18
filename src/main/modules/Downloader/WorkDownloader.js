import EventEmitter from 'events';
import Download from '@/modules/Download';
import WindowManager from '@/modules/WindowManager';

/**
 * @class
 */
class WorkDownloader extends EventEmitter {
  /**
   * @enum {string}
   */
  static state = {
    pending: 'pending',
    downloading: 'downloading',
    error: 'error',
    finish: 'finish'
  }

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
     * @type {string}
     */
    this.title = '';

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

  /**
   * @param {Object} param
   * @param {number|string} param.workId
   * @param {Object} options
   * @returns {WorkDownloader}
   */
  static createDownloader({workId, options}) {
    let workDownloader = new WorkDownloader();

    workDownloader.id = workId;
    workDownloader.options = options;

    return workDownloader;
  }

  isPending() {
    return this.state === WorkDownloader.state.pending;
  }

  start() {
    //
  }

  stop() {
    //
  }

  destroy() {
    //
  }
}

export default WorkDownloader;
