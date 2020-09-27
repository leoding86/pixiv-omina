import EventEmitter from 'events';
import UndeterminedDownloader from '@/modules/Downloader/WorkDownloader/UndeterminedDownloader';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import {
  debug
} from '@/global';
import fs from 'fs-extra';
import { shell } from 'electron';

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
    this.attachedListenersDownloaders = new Map();

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
   * @returns {void}
   */
  addWorkDownloader(downloader) {
    this.workDownloaderPool.set(downloader.id, downloader);
    this.emit('add', downloader);
    this.startWorkDownloader({ downloadId: downloader.id });
  }

  /**
   * @param {WorkDownloader} downloader
   * @returns {void}
   */
  transformWorkDownloader(downloader) {
    this.workDownloaderPool.set(downloader.id, downloader);
    this.emit('update', downloader);
    this.startWorkDownloader({ downloadId: downloader.id });
  }

  /**
   * Add multiple downloaders to download manager
   * @param {Array.<WorkDownloader>} downloaders
   * @param {Object} [options]
   * @param {Boolean} [options.mute=false]
   * @param {Boolean} [options.autoStart=false]
   * @param {WorkDownloader} [options.replace=null]
   * @returns {void}
   */
  addDownloaders(downloaders, options) {
    const { mute, autoStart, replace } = Object.assign({mute: false, autoStart: false, replace: null}, options);

    let addedDownloaders = [];
    let addedDownloadersMap = new Map();

    downloaders.forEach(downloader => {
      if (!this.getWorkDownloader(downloader.id)) {
        this.attachListenersToDownloader(downloader);
        addedDownloadersMap.set(downloader.id, downloader);
        addedDownloaders.push(downloader);
      }
    });

    if (replace && this.getWorkDownloader(replace.id)) {
      let beforeReplaceDownloadersMap = new Map();
      let afterReplaceDownloadersMap = new Map();
      let found = false;

      this.workDownloaderPool.forEach((downloader, id) => {
        if (id !== replace.id) {
          if (found) {
            afterReplaceDownloadersMap.set(id, downloader);
          } else {
            beforeReplaceDownloadersMap.set(id, downloader);
          }
        } else {
          this.emit('delete', id);
          this.workDownloaderPool.delete(id);
          found = true;
        }
      });

      this.workDownloaderPool = new Map([
        ...beforeReplaceDownloadersMap,
        ...addedDownloadersMap,
        ...afterReplaceDownloadersMap
      ]);
    } else {
      this.workDownloaderPool = new Map([
        ...this.workDownloaderPool,
        ...addedDownloadersMap
      ]);
    }

    if (!mute) this.emit('add-batch', addedDownloaders);

    if (autoStart) {
      this.downloadNext();
    }
  }

  reachMaxDownloading() {
    let downloadingCount = 0;

    this.workDownloaderPool.forEach(workDownloader => {
      if (workDownloader.isDownloading() || workDownloader.isProcessing()) {
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
        downloadId: nextWorkDownloader.id
      });

      if (!this.reachMaxDownloading()) {
        this.downloadNext();
      }
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
      this.emit('stop', downloader);
    }

    this.deattachListenersFromDownloader(downloader);
  }

  /**
   * @param {Object} args
   * @param {WorkDownloader} args.downloader
   */
  workDownloaderProgressHandler({ downloader }) {
    if (this.getWorkDownloader(downloader.id)) {
      this.emit('update', downloader);
    }
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

    this.emit('finish', downloader);

    this.deattachListenersFromDownloader(downloader);

    this.downloadNext();
  }

  /**
   * @param {WorkDownloader} workDownloader
   */
  attachListenersToDownloader(workDownloader) {
    /**
     * Prevent listeners attach to downloader multiple times
     */
    if (this.attachedListenersDownloaders.has(workDownloader.id)) {
      return;
    }

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

    /**
     * Remove downloader from the attachedListenersDownloaders to make sure the listeners can
     * attache to the downloader again
     */
    this.attachedListenersDownloaders.delete(workDownloader.id);
  }

  /**
   * Get all downloader
   */
  getAllDownloader()
  {
    return this.workDownloaderPool;
  }

  canStartDownload(download) {
    return ['finish', 'stopping', 'downloading', 'processing'].indexOf(download.state) < 0;
  }

  /**
   *
   * @param {Object} options
   * @param {Object} options.provider
   * @param {Object} options.options
   */
  createDownloader({provider, options}) {
    debug.sendStatus('try to create a download');

    try {
      fs.ensureDirSync(options.saveTo);
    } catch (error) {
      debug.sendStatus('cannot create save dir(s)');
      Promise.reject(error);
      return;
    }

    this.addWorkDownloader(UndeterminedDownloader.createDownloader({ provider, options }));
  }

  /**
   * @param {Object} param
   * @param {number|string} param.downloadId
   * @param {boolean} param.reset
   */
  startWorkDownloader({downloadId, reset}) {
    let workDownloader = this.getWorkDownloader(downloadId);

    if (workDownloader && this.canStartDownload(workDownloader)) {

      if (reset) {
        workDownloader.reset();
      }

      this.attachListenersToDownloader(workDownloader);

      if (!this.reachMaxDownloading()) {
        workDownloader.start();
      } else {
        workDownloader.setPending();
        this.emit('update', workDownloader);
      }
    }
  }

  /**
   * Once stop a download, try to start next avaliable download
   * @param {Object} param
   * @param {number|string} param.downloadId//
   */
  stopWorkDownloader({downloadId}) {
    let workDownloader = this.getWorkDownloader(downloadId);

    if (workDownloader && workDownloader.isStoppable()) {
      workDownloader.stop();
    }

    this.downloadNext();
  }

  /**
   * @param {Object} param
   * @param {number|string} param.downloadId//
   */
  deleteWorkDownloader({downloadId}) {
    let workDownloader = this.getWorkDownloader(downloadId);

    if (workDownloader && !workDownloader.isStopping()) {
      this.workDownloaderPool.delete(downloadId);

      workDownloader.willRecycle();

      workDownloader.stop();

      workDownloader = null;
    }

    this.emit('delete', downloadId);
  }

  /**
   * @param {Object} param
   * @param {Array} param.downloadIds
   */
  deleteDownloads({downloadIds}) {
    let deletedDownloadIds = [];

    downloadIds.forEach(downloadId => {
      let download = this.getWorkDownloader(downloadId);

      if (download && !download.isStopping()) {
        this.workDownloaderPool.delete(downloadId);

        deletedDownloadIds.push(download.id);

        download.willRecycle();

        download.stop({
          mute: true
        });

        download = null;
      }
    });

    this.emit('delete-batch', deletedDownloadIds);
  }

  /**
   * Once stop downloads, try to start next avaliable download
   * @param {Object} param
   * @param {Array} param.downloadIds
   */
  stopDownloads({downloadIds}) {
    let stoppedDownloadIds = [];

    downloadIds.forEach(downloadId => {
      let download = this.getWorkDownloader(downloadId);

      if (download) {
        try {
          download.stop({
            mute: true
          });

          this.deattachListenersFromDownloader(download);

          stoppedDownloadIds.push(download.id);
        } catch (error) {
          if (error.name === 'WorkDownloaderUnstoppableError') {
            debug.sendStatus(`Download ${download.id} cannot be stopped`);
          } else {
            debug.sendStatus(`Download ${download.id} error ${error.message}`)
          }
        }
      }
    });

    this.emit('stop-batch', stoppedDownloadIds);

    this.downloadNext();
  }

  /**
   * @param {Object} param
   * @param {number|string} param.downloadId
   */
  openFolder({downloadId}) {
    let downloader = this.getWorkDownloader(downloadId);

    if (downloader) {
      shell.showItemInFolder(downloader.savedTarget);
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
