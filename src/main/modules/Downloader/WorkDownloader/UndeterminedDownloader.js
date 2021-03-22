import { debug } from '@/global';
import DownloadManager from '@/modules/Downloader/DownloadManager';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';

/**
 * @typedef {Object} UndetermindDownloaderOptions
 * @property {String} saveTo
 * @property {Object} acceptTypes
 * @property {Boolean} [acceptTypes.ugoira=true]
 * @property {Boolean} [acceptTypes.illustration=true]
 * @property {Boolean} [acceptTypes.manga=true]
 */

 /**
  * It's a special downloader is used for get real downloader like illustration/manga/ugoira downloader
  * @class
  */
class UndeterminedDownloader extends WorkDownloader {

  /**
   * @constructor
   */
  constructor() {
    super();

    /**
     * @type {UndetermindDownloaderOptions}
     */
    this.options;

    this.downloadManager = DownloadManager.getManager();
  }

  /**
   * @param {Object} param
   * @param {number|string} param.provider
   * @param {UndetermindDownloaderOptions} param.options
   * @returns {WorkDownloader}
   */
  static createDownloader({provider, options}) {
    let downloader = new UndeterminedDownloader();

    downloader.provider = provider;
    downloader.url = downloader.provider.url;
    downloader.id = downloader.provider.id;
    downloader.options = Object.assign({
      acceptTypes: {
        ugoira: true,
        illustration: true,
        manga: true
      }
    }, options);

    return downloader;
  }

  addDownloaders(provider) {
    let promise = provider.provideMultipleDownloaders
                  ? provider.getDownloaders(this.options)
                  : provider.getDownloader(this.options);
    promise.then(downloader => {
      if (Array.isArray(downloader)) {
        this.downloadManager.addDownloaders(downloader, { replace: this });
      } else {
        this.downloadManager.transformWorkDownloader(downloader);
      }
    }).catch(error => {
      this.setError(error);
    });
  }

  /**
   * @override
   * @returns {void}
   */
  start() {
    this.setDownloading('resolving downloader');

    if (this.provider) {
      this.addDownloaders(this.provider);
    } else {
      this.setError(Error('Unsupported download provider'));
    }
  }

  reset() {
    // ignore but must have it
  }
}

export default UndeterminedDownloader;
