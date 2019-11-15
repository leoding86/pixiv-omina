import EventEmitter from 'events';
import Downloader from './Downloader';
import WindowManager from './WindowManager';

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
     * @type {Downloader}
     */
    this.downloader = null;

    /**
     * @type {string}
     */
    this.workUrl = null;

    /**
     * @type {string|number}
     */
    this.type = null;
  }

  /**
   * @returns {WorkDownloader}
   */
  static createDownloader() {
    return new WorkDownloader();
  }

  download() {
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
