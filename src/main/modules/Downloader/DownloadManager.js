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

    this.maxProcessing = 2;
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
  appendWorkDownloader(downloader) {
    if (!this.getWorkDownloader(downloader.id)) {
      this.workDownloaderPool.set(downloader.id, downloader);
    }

    return this;
  }

  reachMaxProcessing() {
    let processingCount = 0;

    this.workDownloaderPool.forEach(workDownloader => {
      if (workDownloader.isProcessing()) {
        processingCount++;
      }
    });

    return processingCount >= this.maxProcessing;
  }

  /**
   * Find next downloader and start download.
   * @returns {void}
   */
  downloadNext() {
    let processingWorksCount = 0;

    if (this.workDownloaderPool.size() < 1) {
      return;
    }

    let nextWorkDownloader;

    this.workDownloaderPool.forEach(workDownloader => {
      if (!nextWorkDownloader && workDownloader.isPending()) {
        nextWorkDownloader = workDownloader;
      }

      if (workDownloader.isProcessing()) {
        processingWorksCount++;
      }
    });

    if (processingWorksCount < this.maxProcessing) {
      nextWorkDownloader.start();
    }
  }

  /**
   * @param {Object} args
   * @param {WorkDownloader} args.workDownloader
   */
  workDownloaderStartHandler({workDownloader}) {
    this.emit('start', {workDownloader});
  }

  /**
   * @param {Object} args
   * @param {WorkDownloader} args.workDownloader
   */
  workDownloaderStopHandler({workDownloader}) {
    this.emit('stop', {workDownloader});

    this.downloadNext();
  }

  /**
   * @param {Object} args
   * @param {WorkDownloader} args.workDownloader
   */
  workDownloaderProgressHandler({workDownloader}) {
    this.emit('progress', {workDownloader});
  }

  /**
   * @param {Object} args
   * @param {WorkDownloader} args.workDownloader
   */
  workDownloaderErrorHandler({workDownloader}) {
    this.emit('error', {workDownloader});

    this.downloadNext();
  }

  /**
   * @param {Object} args
   * @param {WorkDownloader} args.workDownloader
   */
  workDownloaderFinishHandler({workDownloader}) {
    this.emit('finish', {workDownloader});

    this.downloadNext();
  }

  /**
   * @param {WorkDownloader} workDownloader
   */
  attachListenersToDownloader(workDownloader) {
    workDownloader.on('start', this.workDownloaderStartHandler);
    workDownloader.on('stop', this.workDownloaderStopHandler);
    workDownloader.on('progress', this.workDownloaderProgressHandler);
    workDownloader.on('error', this.workDownloaderErrorHandler);
    workDownloader.on('finish', this.workDownloaderFinishHandler);
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

    this.appendWorkDownloader(workDownloader);

    this.emit('add', workDownloader);

    DownloaderFactory.makeDownloader(workDownloader).then(downloader => {
      if (this.workDownloaderPool.has(downloader.id)) {
        this.workDownloaderPool.set(downloader.id, downloader);

        this.attachListenersToDownloader(downloader);

        this.emit('update', downloader);
      }
    }).catch(error => {
      this.emit('error', workDownloader);
    });
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

    this.emit('delete', {workId});
  }

  /**
   * @param {Object} param
   * @param {number|string} param.workId
   */
  startWorkDownloader({workId}) {
    let workDownloader = this.getWorkDownloader(workId);

    if (workDownloader && !this.reachMaxProcessing()) {
      workDownloader.start();
    }
  }

  /**
   * @param {Object} param
   * @param {number|string} param.workId
   */
  stopWorkDownloader({workId}) {
    let workDownloader = this.getWorkDownloader(workId);

    if (workDownloader) {
      workDownloader.stop();
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
