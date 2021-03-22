import Download from '@/modules/Download';
import SettingStorage from '@/modules/SettingStorage';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import MangaProvider from '@/modules/Downloader/Providers/Pixiv/MangaProvider';

/**
 * @class
 */
class MangaDownloader extends WorkDownloader {
  constructor() {
    super();

    /**
     * @type {MangaProvider}
     */
    this.provider;

    this.images = [];

    this.imageIndex = 0;

    this.type = 1;

    this.downloadSpeed = 0;

    this.downloadCompletedDataSize = 0;

    this.downloadEscapedTime = 0;

    this.downloadTotalCompletedDataSize = 0;

    this.downloadTotalEscapedTime = 0;
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
   * @override
   * @returns {Number}
   */
  get speed() {
    return Math.round(this.downloadCompletedDataSize / this.downloadEscapedTime * 1000);
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
   * @returns {this}
   */
  makeSaveOption() {
    return this.makeSaveOptionFromRenameTemplate(SettingStorage.getSetting('mangaRename'));
  }

  /**
   * @returns {void}
   */
  downloadImages() {
    let url = this.images[this.imageIndex].urls.original,
        nowTime = 0;

    /**
     * Must set pageNum property in context for make sure the rename image works correctly
     */
    this.context.pageNum = this.imageIndex;

    this.makeSaveOption();

    let downloadOptions = Object.assign(
      {},
      this.options,
      {
        url: url,
        saveTo: this.saveFolder,
        saveName: this.saveFilename
      }
    );

    this.download = new Download(downloadOptions);

    this.download.on('dl-finish', ({ file }) => {
      if (!this.savedTarget) {
        this.savedTarget = file;
      }

      this.imageIndex++;

      this.progress = this.imageIndex / this.images.length;
      this.downloadTotalCompletedDataSize += this.download.totalDataSize;
      this.downloadTotalEscapedTime += this.download.escapedTime;

      this.setDownloading();

      if (this.imageIndex > (this.images.length - 1)) {
        this.setFinish();
        this.download = null;
      } else {
        this.downloadImages();
      }
    });

    this.download.on('dl-progress', () => {
      this.downloadCompletedDataSize = this.downloadTotalCompletedDataSize + this.download.completedDataSize;
      this.downloadEscapedTime = this.downloadTotalEscapedTime + this.download.escapedTime;
      this.progress += this.download.progress / this.images.length;
      console.log('dl-progress', this, this.download);
      this.setDownloading(`downloading ${this.imageIndex} / ${this.images.length}`);
    });

    this.download.on('dl-error', error => {
      this.setError(error);
      this.download = null;
    });

    this.download.on('dl-aborted', () => {
      this.setStop();
      this.download = null;
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
