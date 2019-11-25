import EventEmitter from 'events';
import { shell } from 'electron';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import UndeterminedDownloader from '@/modules/Downloader/WorkDownloader/UndeterminedDownloader';

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

    /**
     * @property
     * @type {Map<number|string, WorkDownloader>}
     */
    this.deletingDownloaders = new Map();

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

      this.startWorkDownloader({downloadId: downloader.id});
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
    if (this.workDownloaderPool.size < 1) {
      return;
    }

    let nextWorkDownloader;

    this.workDownloaderPool.forEach(workDownloader => {
      if (!nextWorkDownloader && workDownloader.isPending()) {
        nextWorkDownloader = workDownloader;
      }
    });

    if (nextWorkDownloader) {
      this.startWorkDownloader({
        workId: nextWorkDownloader.id
      });
    }
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
    /**
     * Make sure the downloader is exists then fire the update event
     * Because this listener can be called by a delete operation
     */
    if (this.workDownloaderPool.has(downloader.id)) {
      this.emit('update', downloader);
    }

    this.deattachListenersFromDownloader(downloader);

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

    this.deattachListenersFromDownloader(downloader);

    this.downloadNext();
  }

  /**
   * @param {Object} args
   * @param {WorkDownloader} args.downloader
   */
  workDownloaderFinishHandler({ downloader }) {
    this.emit('update', downloader);

    this.deattachListenersFromDownloader(downloader);

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
    workDownloader.removeAllListeners('start');
    workDownloader.removeAllListeners('stop');
    workDownloader.removeAllListeners('progress');
    workDownloader.removeAllListeners('error');
    workDownloader.removeAllListeners('finish');
  }

  /**
   * Get all downloader
   */
  getAllDownloader()
  {
    return this.workDownloaderPool;
  }

  /**
   * Create a downloader
   * @param {Object} args
   * @param {string|number} args.workId
   * @param {Object} args.options
   * @returns {DownloadManager}
   */
  createWorkDownloader({workId, options}) {
    let undeterminedDownloader = UndeterminedDownloader.createDownloader({ workId, options });

    this.addWorkDownloader(undeterminedDownloader);
  }

  /**
   * @param {Object} param
   * @param {number|string} param.downloadId
   * @param {boolean} param.reset
   */
  startWorkDownloader({downloadId, reset}) {
    let workDownloader = this.getWorkDownloader(downloadId);

    if (workDownloader) {

      if (reset) {
        workDownloader.reset();
      }

      if (!this.reachMaxDownloading()) {

        this.attachListenersToDownloader(workDownloader);

        if (Object.getPrototypeOf(workDownloader) === UndeterminedDownloader.prototype) {
          workDownloader.getRealDownloader().then(downloader => {
            workDownloader = null;

            this.workDownloaderPool.set(downloader.id, downloader);

            // this.emit('update', downloader);

            this.startWorkDownloader({downloadId: downloader.id});
          }).catch(error => {
            // workDownloader.setError(error);

            // this.emit('update', workDownloader);

            throw error;
          });
        } else {
          workDownloader.start();
        }
      } else {
        workDownloader.setPending();

        this.emit('update', workDownloader);
      }
    }
  }

  /**
   * @param {Object} param
   * @param {number|string} param.downloadId//
   */
  stopWorkDownloader({downloadId}) {
    let workDownloader = this.getWorkDownloader(downloadId);

    if (workDownloader) {
      workDownloader.stop();
    }
  }

  /**
   * @param {Object} param
   * @param {number|string} param.downloadId//
   */
  deleteWorkDownloader({downloadId}) {
    let workDownloader = this.getWorkDownloader(downloadId);

    if (workDownloader) {
      if (this.deletingDownloaders.has(workDownloader)) {
        this.deletingDownloaders.set(workDownloader.id, workDownloader);
      }

      this.workDownloaderPool.delete(downloadId);

      workDownloader.stop();

      workDownloader = null;
    }

    this.emit('delete', downloadId);
  }

  /**
   * @param {Object} param
   * @param {number|string} param.downloadId
   */
  openFolder({downloadId}) {
    let downloader = this.getWorkDownloader(downloadId);

    if (downloader) {
      shell.openItem(downloader.options.saveTo);
    }
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
