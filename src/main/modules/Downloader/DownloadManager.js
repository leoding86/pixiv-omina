import EventEmitter from 'events';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import DownloaderFactory from '@/modules/Downloader/DownloaderFactory';

/**
 * @class
 */
class DownloadManager extends EventEmitter {
  constructor() {
    super();

    /**
     * @property
     * @type {Map<number|string, WorkDownloader>}
     */
    this.workDownloaderPool = new Map();

    this.maxDownloading = 2;
  }

  static instance = null;

  /**
   * @returns {DownloadManager}
   */
  static getManager() {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager();
    }

    return DownloadManager.instance;
  }

  /**
   * @param {number|string} id
   * @returns {WorkDownloader}
   */
  static getWorkDownloader(id) {
    return DownloadManager.instance.getWorkDownloader(id);
  }

  /**
   * @param {WorkDownloader} downloader
   * @returns {this}
   */
  addWorkDownloader(downloader) {
    if (!this.getWorkDownloader(downloader.id)) {
      this.workDownloaderPool.set(downloader.id, downloader);

      this.emit('add', downloader);

      this.startWorkDownloader({workId: downloader.id});
    }

    return this;
  }

  reachMaxDownloading() {
    let downloadingCount = 0;

    this.workDownloaderPool.forEach(workDownloader => {
      if (workDownloader.isDownloading()) {
        downloadingCount++;
      }
    });

    return downloadingCount >= this.maxDownloading;
  }

  /**
   * Find next downloader and start download.
   * @returns {void}
   */
  downloadNext() {
    if (this.workDownloaderPool.size() < 1) {
      return;
    }

    let nextWorkDownloader;

    this.workDownloaderPool.forEach(workDownloader => {
      if (!nextWorkDownloader && workDownloader.isPending()) {
        nextWorkDownloader = workDownloader;
      }
    });

    this.startWorkDownloader({
      workId: nextWorkDownloader.id
    });
  }

  /**
   * @param {Object} args
   * @param {WorkDownloader} args.downloader
   */
  workDownloaderStartHandler({ downloader }) {
    this.emit('update', downloader);
  }

  /**
   * @param {Object} args
   * @param {WorkDownloader} args.downloader
   */
  workDownloaderStopHandler({ downloader }) {

    this.emit('update', downloader);

    this.downloadNext();
  }

  /**
   * @param {Object} args
   * @param {WorkDownloader} args.downloader
   */
  workDownloaderProgressHandler({ downloader }) {
    this.emit('update', downloader);
  }

  /**
   * @param {Object} args
   * @param {WorkDownloader} args.downloader
   */
  workDownloaderErrorHandler({ downloader }) {
    this.emit('update', downloader);

    this.downloadNext();
  }

  /**
   * @param {Object} args
   * @param {WorkDownloader} args.downloader
   */
  workDownloaderFinishHandler({ downloader }) {
    this.emit('update', downloader);

    this.downloadNext();
  }

  /**
   * @param {WorkDownloader} workDownloader
   */
  attachListenersToDownloader(workDownloader) {
    workDownloader.on('start', this.workDownloaderStartHandler.bind(this));
    workDownloader.on('stop', this.workDownloaderStopHandler.bind(this));
    workDownloader.on('progress', this.workDownloaderProgressHandler.bind(this));
    workDownloader.on('error', this.workDownloaderErrorHandler.bind(this));
    workDownloader.on('finish', this.workDownloaderFinishHandler.bind(this));
  }

  /**
   * @param {WorkDownloader} workDownloader
   */
  deattachListenersFromDownloader(workDownloader) {
    workDownloader.off('start', this.workDownloaderStartHandler);
    workDownloader.off('stop', this.workDownloaderStopHandler);
    workDownloader.off('progress', this.workDownloaderProgressHandler);
    workDownloader.off('error', this.workDownloaderErrorHandler);
    workDownloader.off('finish', this.workDownloaderFinishHandler);
  }

  /**
   * Create a downloader
   * @param {Object} args
   * @param {string|number} args.workId
   * @param {Object} args.options
   * @returns {DownloadManager}
   */
  createWorkDownloader({workId, options}) {
    let workDownloader = WorkDownloader.createDownloader({workId, options});

    this.addWorkDownloader(workDownloader);
  }

  /**
   * Convert work downloader to manga/illustration/ugoira downloader
   * @param {WorkDownloader} workDownloader
   * @returns {Promise<WorkDownloader>}
   */
  getTureDownloader(workDownloader) {
    workDownloader.setDownloading();

    return DownloaderFactory.makeDownloader(workDownloader);
  }

  /**
   * @param {Object} param
   * @param {number|string} param.workId
   */
  startWorkDownloader({workId}) {
    let workDownloader = this.getWorkDownloader(workId);

    if (workDownloader && !this.reachMaxDownloading()) {
      /**
       * Set downloader state to pending
       */
      workDownloader.setPending();

      this.emit('update', workDownloader);

      if (Object.getPrototypeOf(workDownloader) === WorkDownloader.prototype) {
        this.getTureDownloader(workDownloader).then(downloader => {
          this.workDownloaderPool.set(downloader.id, downloader);

          this.startWorkDownloader({workId: downloader.id});
        }).catch(error => {
          workDownloader.setErrorStatus(error.message);

          this.emit('update', workDownloader);

          throw error;
        });
      } else {
        this.attachListenersToDownloader(workDownloader);

        workDownloader.start();
      }
    }
  }

  /**
   * @param {Object} param
   * @param {number|string} param.workId
   */
  stopWorkDownloader({workId}) {
    let workDownloader = this.getWorkDownloader(workId);

    if (workDownloader) {
      this.deattachListenersFromDownloader(workDownloader);

      workDownloader.stop();
    }
  }

  /**
   * @param {Object} param
   * @param {number|string} param.workId
   */
  deleteWorkDownloader({workId}) {
    let workDownloader = this.getWorkDownloader(workId);

    if (workDownloader) {
      this.deattachListenersFromDownloader(workDownloader);

      workDownloader.destroy();

      this.workDownloaderPool.delete(workId);

      workDownloader = null;
    }

    this.emit('delete', workId);
  }

  /**
   * @param {number|string} id
   * @returns {WorkDownloader}
   */
  getWorkDownloader(id) {
    if (this.workDownloaderPool.has(id)) {
      return this.workDownloaderPool.get(id);
    }

    return null;
  }
}

export default DownloadManager;
