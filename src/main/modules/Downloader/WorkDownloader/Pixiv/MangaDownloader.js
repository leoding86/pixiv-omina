import Download from '@/modules/Download';
import GeneralArtworkProvider from '@/modules/Downloader/Providers/Pixiv/GeneralArtworkProvider';
import Request from '@/modules/Request';
import SettingStorage from '@/modules/SettingStorage';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';

/**
 * @class
 */
class MangaDownloader extends WorkDownloader {
  constructor() {
    super();

    /**
     * @type {GeneralArtworkProvider}
     */
    this.provider;

    /**
     * @type {Request}
     */
    this.request;

    /**
     * @type {Download}
     */
    this.download;

    /**
     * @type {string[]}
     */
    this.images = [];

    /**
     * @type {number}
     */
    this.imageIndex = 0;

    /**
     * @type {string}
     */
    this.type = 'Pixiv Manga';

    this.tagColor = 'rgb(146, 215, 218)';

    /**
     * @type {number}
     */
    this.downloadSpeed = 0;

    /**
     * @type {number}
     */
    this.downloadCompletedDataSize = 0;

    /**
     * @type {number}
     */
    this.downloadEscapedTime = 0;

    /**
     * @type {number}
     */
    this.downloadTotalCompletedDataSize = 0;

    /**
     * @type {number}
     */
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
   * @param {{ url: string, saveTo: string, options: object, provider: GeneralArtworkProvider }} args
   */
  static createDownloader({ url, saveTo, options, provider }) {
    let downloader = new MangaDownloader();
    downloader.id = provider.id;
    downloader.url = url;
    downloader.saveTo = saveTo;
    downloader.options = options;
    downloader.provider = provider;

    return downloader;
  }

  /**
   * Get artwork pages url
   * @returns {string}
   */
  getPagesUrl() {
    return `https://www.pixiv.net/ajax/illust/${this.provider.context.id}/pages`;
  }

  /**
   * Get image pages
   * @returns {Promise.<string[],Error>}
   */
  requestPages() {
    return new Promise((resolve, reject) => {
      let url = this.getPagesUrl();

      this.request = new Request({
        url: url,
        method: 'GET'
      });

      this.request.on('error', error => {
        reject(error);
      });

      this.request.on('response', response => {
        let body = '';

        response.on('error', error => {
          reject(error);
        });

        response.on('data', data => {
          body += data;
        });

        response.on('end', () => {
          let jsonData = JSON.parse(body.toString());

          if (jsonData && Array.isArray(jsonData.body) && jsonData.body.length > 0) {
            resolve(jsonData.body);
          } else {
            reject(Error('Cannot resolve manga images'));
          }
        });

        response.on('aborted', () => {
          reject(Error('Resolve manga images has been aborted'));
        });
      });

      this.request.on('close', () => {
        this.request = null;
      });

      this.request.end();
    });
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
    let url = this.images[this.imageIndex].urls.original;

    /**
     * Must set pageNum property in context to make renaming image works correctly
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
        if (!(this.isStop() || this.isStopping())) {
          this.downloadImages();
        }
      }
    });

    this.download.on('dl-progress', () => {
      this.downloadCompletedDataSize = this.downloadTotalCompletedDataSize + this.download.completedDataSize;
      this.downloadEscapedTime = this.downloadTotalEscapedTime + this.download.escapedTime;
      this.progress += this.download.progress / this.images.length;
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
      this.setDownloading('_fetch_images_in_the_artwork');

      this.requestPages().then(images => {
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
