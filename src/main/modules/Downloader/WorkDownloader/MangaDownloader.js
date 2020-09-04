import Download from '@/modules/Download';
import FormatName from '@/modules/Utils/FormatName';
import SettingStorage from '@/modules/SettingStorage';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import path from 'path';
import { PixivMangaProvider } from '../Providers';

/**
 * @class
 */
class MangaDownloader extends WorkDownloader {
  constructor() {
    super();

    /**
     * @type {PixivMangaProvider}
     */
    this.provider;

    this.images = [];

    this.imageIndex = 0;

    this.type = 1;
  }

  /**
   * @override
   * @returns {string}
   */
  get title() {
    if (this.context) {
      return this.context.title
    } else if (this.title) {
      return this.title;
    } else {
      return this.id;
    }
  }

  /**
   *
   * @param {Object} options
   * @param {PixivMangaProvider} options.provider
   * @param {Object} options.options
   */
  static createDownloader({ provider, options }) {
    let downloader = new MangaDownloader();
    downloader.provider = provider;
    downloader.url = provider.url;
    downloader.id = provider.id;
    downloader.options = options;
    downloader.context = downloader.provider.context;

    return downloader;
  }

  /**
   * @returns {String}
   */
  getImageSaveName() {
    return FormatName.format(SettingStorage.getSetting('mangaRename').split('/').pop(), this.context);
  }

  /**
   * @override
   * @returns {String}
   */
  getImageSaveFolder() {
    let parts = SettingStorage.getSetting('mangaRename').split('/');

    if (parts.length > 1) {
      parts.pop();
    }

    return path.join(this.options.saveTo, FormatName.format(parts.join('/'), this.context, null, { mode: 'folder' }), '/');
  }

  /**
   * @returns {void}
   */
  downloadImages() {
    let url = this.images[this.imageIndex].urls.original;

    /**
     * Must set pageNum property in context for make sure the rename image works correctly
     */
    this.context.pageNum = this.imageIndex;

    let downloadOptions = Object.assign(
      {},
      this.options,
      {
        url: url,
        saveTo: this.getImageSaveFolder(),
        saveName: this.getImageSaveName()
      }
    );

    this.download = new Download(downloadOptions);

    this.download.on('dl-finish', ({ file }) => {
      if (!this.savedTarget) {
        this.savedTarget = file;
      }

      this.imageIndex++;

      this.progress = this.imageIndex / this.images.length;

      this.setDownloading();

      if (this.imageIndex > (this.images.length - 1)) {//
        this.setFinish();

        this.download = null;
        return;
      }

      this.downloadImages();
    });

    this.download.on('dl-progress', () => {
      this.setDownloading(`downloading ${this.imageIndex} / ${this.images.length}`);
    });

    this.download.on('dl-error', error => {
      this.download = null;

      this.setError(error);
    });

    this.download.on('dl-aborted', () => {
      this.download = null;

      this.setStop();
    });

    this.download.download();
  }

  reset() {
    super.reset();
    this.images = [];
    this.imageIndex = 0;
  }

  start() {
    this.setStart();

    if (this.images.length === 0) {
      this.setDownloading('Fetch images that need to be downloaded');

      this.provider.requestPages().then(images => {
        this.images = images;

        this.downloadImages();
      }).catch(error => {
        this.setError(error);
      });
    } else {
      this.setDownloading();

      this.downloadImages();
    }
  }

  toJSON() {
    let data = super.toJSON();

    data.total = this.images.length;
    data.complete = this.imageIndex;

    return data;
  }
}

export default MangaDownloader;
