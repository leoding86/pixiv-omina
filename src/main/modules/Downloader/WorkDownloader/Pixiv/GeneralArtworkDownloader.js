import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import DownloadManager from '@/modules/Downloader/DownloadManager';
import GeneralArtworkProvider from '@/modules/Downloader/Providers/Pixiv/GeneralArtworkProvider';
import IllustrationDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/IllustrationDownloader';
import MangaDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/MangaDownloader';
import UgoiraDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/UgoiraDownloader';
import Request from '@/modules/Request';

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
  }

  /**
   * Create a GeneralArtworkDownloader downloader
   * @param {{url: String, saveTo: String, types: Object, provider: GeneralArtworkProvider }} options
   * @returns {GeneralArtworkDownloader}
   */
  static createDownloader({ url, saveTo, types, provider }) {
    let downloader = new GeneralArtworkDownloader();
    downloader.id = provider.id;
    downloader.url = url;
    downloader.saveTo = saveTo;
    downloader.provider = provider;
    downloader.options = { types };

    return downloader;
  }

  /**
   * Get artwork info url
   * @returns {string}
   */
  getInfoUrl() {
    return `https://www.pixiv.net/ajax/illust/${this.id}`;
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
   * @param {Object} options
   * @returns {Promise}
   */
  transformDownloader(options) {
    let downloadManager = DownloadManager.getManager();

    this.requestInfo().then(context => {
      let downloader;

      if (context.illustType === 0) {
        if (options.acceptTypes.illustration) {
          /**
           * refactor!!!
           */
          downloader = IllustrationDownloader.createDownloader({
            url: this.url,
            saveTo: this.saveTo,
            types: this.options.types,
            provider: this.provider
          });
          // downloader = IllustrationDownloader.createDownloader({
          //   provider: IllustrationProvider.createProvider({ url: this.url, context }),
          //   options
          // })
        } else {
          downloadManager.deleteWorkDownloader({ downloadId: this.id });
          debug.log(Error(`Downloader ${this.id} is deleted because it isn't accepted type which is illustration type`));
          return;
        }
      } else if (context.illustType === 1) {
        if (options.acceptTypes.manga) {
          /**
           * refactor!!!
           */
          downloader = MangaDownloader.createDownloader({
            url: this.url,
            saveTo: this.saveTo,
            types: this.options.types,
            provider: this.provider
          });
          // downloader = MangaDownloader.createDownloader({
          //   provider: MangaProvider.createProvider({ url: this.url, context }),
          //   options
          // });
        } else {
          downloadManager.deleteWorkDownloader({ downloadId: this.id });
          debug.log(Error(`Downloader ${this.id} is deleted because it isn't accepted type which is manga type`));
          return;
        }
      } else if (context.illustType === 2) {
        if (options.acceptTypes.ugoira) {
          /**
           * refactor!!!
           */
          downloader = UgoiraDownloader.createDownloader({
            url: this.url,
            saveTo: this.saveTo,
            types: this.options.types,
            provider: this.provider
          });
          // downloader = UgoiraDownloader.createDownloader({
          //   provider: UgoiraProvider.createProvider({ url: this.url, context }),
          //   options
          // });
        } else {
          downloadManager.deleteWorkDownloader({ downloadId: this.id });
          debug.log(Error(`Downloader ${this.id} is deleted because it isn't accepted type which is ugoira type`));
          return;
        }
      } else {
        debug.log(Error(`Unsuppoert artwork type ${context.illustType}`));
      }

      /**
       * Transform current downloader to specific artwork downloader
       */
      downloadManager.transformWorkDownloader(downloader);
    });
  }

  /**
   * Start download
   */
  start() {
    this.transformDownloader();
  }
}

export default GeneralArtworkDownloader;
