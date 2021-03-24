import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import DownloadManager from '@/modules/Downloader/DownloadManager';
import GeneralArtworkProvider from '@/modules/Downloader/Providers/Pixiv/GeneralArtworkProvider';
import IllustrationDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/IllustrationDownloader';
import MangaDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/MangaDownloader';
import UgoiraDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/UgoiraDownloader';
import Request from '@/modules/Request';
import DateFormatter from '@/../utils/DateFormatter';

/**
 * @class
 */
class GeneralArtworkDownloader extends WorkDownloader {
  /**
   * @constructor
   */
  constructor() {
    super();

    /**
     * @type {Request}
     */
    this.request;

    /**
     * Set provider type, used for displaying at UI
     * @type {String}
     */
    this.type = 'Pixiv Artwork';

    this.options = {
      acceptTypes: {
        ugoira: true,
        illustration: true,
        manga: true
      }
    };
  }

  /**
   * Create a GeneralArtworkDownloader downloader
   * @param {{url: String, saveTo: String, options: Object, provider: GeneralArtworkProvider }} options
   * @returns {GeneralArtworkDownloader}
   */
  static createDownloader({ url, saveTo, options, provider }) {
    let downloader = new GeneralArtworkDownloader();
    downloader.id = provider.id;
    downloader.url = url;
    downloader.saveTo = saveTo;
    downloader.options = Object.assign(downloader.options, options);
    downloader.provider = provider;

    return downloader;
  }

  /**
   * Get artwork info url
   * @returns {string}
   */
  getInfoUrl() {
    return `https://www.pixiv.net/ajax/illust/${this.provider.context.id}`;
  }

  /**
   * @returns {Promise.<object,Error>}
   */
  requestInfo() {
    return new Promise((resolve, reject) => {
      let url = this.getInfoUrl();

      this.request = new Request({
        url: url,
        method: 'GET'
      });

      this.request.on('response', response => {
        let body = '';

        response.on('data', data => {
          body += data;
        });

        response.on('aborted', () => {
          reject(Error('response has been aborted'));
        });

        response.on('end', () => {
          let jsonData = JSON.parse(body.toString());

          if (!jsonData || jsonData.error || !jsonData.body) {
            let error = Error('cannot resolve work info');
            reject(error);
          } else {
            /**
             * Set work info as context to downloader
             */
            let dateFormatter = DateFormatter.getDefault(jsonData.body.createDate);

            let context = Object.assign(jsonData.body, {
              year: dateFormatter.getYear(),
              month: dateFormatter.getMonth(),
              day: dateFormatter.getDay()
            });

            resolve(context);
          }
        });

        response.on('error', error => {
          reject(error);
        })
      });

      this.request.on('abort', () => {
        reject(Error('request has been aborted'));
      });

      this.request.on('error', error => {
        reject(error);
      });

      this.request.on('close', () => {
        this.request = null;
      });

      this.request.end();
    });
  }

  /**
   * Transform general downloader to specific downloader
   * @returns {void}
   */
  transformDownloader() {
    return new Promise((resolve, reject) => {
      let downloadManager = DownloadManager.getManager();

      this.setDownloading('_resolving_artwork_type');

      this.requestInfo().then(context => {
        let downloader;

        if (context.illustType === 0) {
          if (this.options.acceptTypes.illustration) {
            downloader = IllustrationDownloader.createDownloader({
              url: this.url,
              saveTo: this.saveTo,
              options: this.options,
              provider: this.provider
            });
          } else {
            downloadManager.deleteWorkDownloader({ downloadId: this.id });
            debug.log(Error(`Downloader ${this.id} is deleted because it isn't accepted type which is illustration type`));
          }
        } else if (context.illustType === 1) {
          if (this.options.acceptTypes.manga) {
            downloader = MangaDownloader.createDownloader({
              url: this.url,
              saveTo: this.saveTo,
              options: this.options,
              provider: this.provider
            });
          } else {
            downloadManager.deleteWorkDownloader({ downloadId: this.id });
            debug.log(Error(`Downloader ${this.id} is deleted because it isn't accepted type which is manga type`));
            return;
          }
        } else if (context.illustType === 2) {
          if (this.options.acceptTypes.ugoira) {
            downloader = UgoiraDownloader.createDownloader({
              url: this.url,
              saveTo: this.saveTo,
              options: this.options,
              provider: this.provider
            });
          } else {
            downloadManager.deleteWorkDownloader({ downloadId: this.id });
            debug.log(Error(`Downloader ${this.id} is deleted because it isn't accepted type which is ugoira type`));
          }
        } else {
          debug.log(Error(`Unsuppoert artwork type ${context.illustType}`));
        }

        /**
         * Set downloader's context
         */
        downloader.context = context;

        /**
         * Transform current downloader to specific artwork downloader
         */
        downloadManager.transformWorkDownloader(downloader);

        resolve();
      });
    });
  }

  /**
   * Start download
   */
  start() {
    this.setStart();
    this.transformDownloader().then(() => {
      this.setDownloading('_create_downloader');
    }).catch(error => {
      this.setError(error);
    });
  }
}

export default GeneralArtworkDownloader;
