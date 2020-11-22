import Download from '@/modules/Download';
import EventEmitter from 'events';
import Request from '@/modules/Request';
import WindowManager from '@/modules/WindowManager';
import WorkDownloaderUnstoppableError from './WorkDownloaderUnstoppableError';
import path from 'path';
import {
  PixivBookmarkProvider,
  PixivUserProvider,
  PixivGeneralArtworkProvider,
  PixivMangaProvider,
  PixivIllustrationProvider,
  PixivUgoiraProvider,
  PixivComicEpisodProvider
} from './Providers';

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
    this.url = null;

    /**
     * @type {PixivBookmarkProvider|PixivUserProvider|PixivGeneralArtworkProvider|PixivMangaProvider|PixivIllustrationProvider|PixivUgoiraProvider|PixivComicEpisodProvider}
     */
    this.provider = null;

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

    /**
     * If mute is true, the intance will not fire any events
     */
    this.mute = false;
  }

  get speed() {
    if (this.download) {
      return this.download.speed;
    }

    return 0;
  }

  get title() {
    return this.url;
  }

  get externalUrl() {
    return this.url;
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
   * @param {Object} param.provider
   * @param {Object} param.options
   * @returns {WorkDownloader}
   */
  static createDownloader({provider, options}) {
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
    throw Error('Method getImageSaveFolder is not implemented');
  }

  getRelativeSaveFolder() {
    throw Error('Method getRelativeSaveFolder is not implemented');
  }

  isUser() {
    return !!this.options.isUser;
  }

  setContext(context) {
    this.context = context;
  }

  setMute(mute = false) {
    this.mute = mute;
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

    if (!this.recycle && !this.mute) {
      this.emit('progress', { downloader: this });
    }
  }

  setStop(message) {
    this.statusMessage = message || 'Stopped';
    this.state = WorkDownloader.state.stop;

    if (!this.recycle && !this.mute) {
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
    console.error(error);
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

  /**
   * Check if the downloader can be stopped
   */
  isStoppable() {
    return !(this.isStopping() || this.isProcessing());
  }

  /**
   * Stop the downloader
   * @param {Object} options
   * @param {Boolean} [options.mute=false]
   * @throws {WorkDownloaderUnstoppableError}
   */
  stop(options) {
    if (!this.isStoppable()) {
      throw new WorkDownloaderUnstoppableError();
    }

    let { mute = false } = Object.assign({}, options);//

    this.setMute(mute);

    this.setStopping();

    this.provider && this.provider.request && this.provider.request.abort();
    this.download && this.download.abort();
    this.request && this.request.abort();

    this.setStop();

    /**
     * Enable firing events again
     */
    this.setMute(false);
  }

  delete() {
    throw 'Not implemeneted';
  }

  toJSON() {
    let data = {
      id: this.id,
      title: this.title,
      externalUrl: this.externalUrl,
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
