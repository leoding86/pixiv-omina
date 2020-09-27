import path from 'path';
import SettingStorage from '@/modules/SettingStorage';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import Download from '@/modules/Download';
import FormatName from '@/modules/Utils/FormatName';

class EpisodeDownloader extends WorkDownloader {

  /**
   * @constructor
   */
  constructor() {
    super();

    this.type = 20;

    this.pageIndex = 0;
  }

  /**
   * @param {Object} param
   * @param {number|string} param.provider
   * @param {Object} param.options
   * @returns {WorkDownloader}
   */
  static createDownloader({provider, options}) {
    let downloader = new EpisodeDownloader();

    downloader.provider = provider;
    downloader.context = provider.context;
    downloader.url = downloader.provider.url;
    downloader.id = downloader.provider.id;
    downloader.options = Object.assign({}, options);

    return downloader;
  }

  get title() {
    if (this.context) {
      return (this.context.workTitle ? (this.context.workTitle + ' ') : '') +
        (this.context.title ? this.context.title : this.context.id);
    } else {
      return this.id;
    }
  }

  /**
   * @returns {string}
   */
  get externalUrl() {
    return EpisodeProvider.getEpisodeUrl(this.context.id);
  }

  /**
   * @returns {String}
   */
  getImageSaveName() {
    return FormatName.format(SettingStorage.getSetting('pixivComicWorkRename').split('/').pop(), this.context);
  }

  /**
   * @override
   * @returns {String}
   */
  getImageSaveFolder() {
    let parts = SettingStorage.getSetting('pixivComicWorkRename').split('/');

    if (parts.length > 1) {
      parts.pop();
    }

    return path.join(this.options.saveTo, FormatName.format(parts.join('/'), this.context, null, { mode: 'folder' }), '/');
  }

  downloadImages() {
    let url = this.context.pages[this.pageIndex].url;

    /**
     * Must set pageNum property in context for make sure the rename image works correctly
     */
    this.context.pageNum = this.pageIndex;

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

      this.pageIndex++;

      this.progress = this.pageIndex / this.context.pages.length;

      this.setDownloading();

      if (this.pageIndex > (this.context.pages.length - 1)) {
        this.setFinish();
        this.download = null;
        return;
      } else {
        this.downloadImages();
      }
    });

    this.download.on('dl-progress', () => {
      this.setDownloading(`downloading ${this.pageIndex} / ${this.context.pages.length}`);
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

  /**
   * @override
   */
  start() {
    this.setStart();

    if (!this.context.pages) {
      this.setDownloading('Fetch images that need to be downloaded');

      this.provider.requestEpisodeData().then(context => {
        this.context = context;

        this.setDownloading();

        this.downloadImages();
      }).catch(error => {
        console.error(error);
        this.setError(error);
      });
    } else {
      this.setDownloading();

      this.downloadImages();
    }
  }
}

export default EpisodeDownloader;
