import Request from '@/modules/Request';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import IllustrationDownloader from '@/modules/Downloader/WorkDownloader/IllustrationDownloader';
import MangaDownloader from '@/modules/Downloader/WorkDownloader/MangaDownloader';
import UrlBuilder from '@/../utils/UrlBuilder';

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
     * @property
     * @type {Request}
     */
    this.request = null;
  }

  /**
   * @returns {Promise<WorkDownloader>}
   */
  getRealDownloader() {
    return new Promise((resolve, reject) => {
      this.state = UndeterminedDownloader.state.downloading;
      this.statusMessage = 'Resovling downloader';

      let url = UrlBuilder.getWorkInfoUrl(this.id);

      this.request = new Request({
        url: url,
        method: 'GET'
      });

      this.request.on('response', response => {
        let body = '';

        response.on('data', data => {
          body += data;
        });

        response.on('end', () => {
          let jsonData = JSON.parse(body.toString());

          if (!jsonData || jsonData.error || !jsonData.body) {
            reject(Error('cannot resolve work info'));
            return;
          }

          /**
           * Set work info as context to downloader
           */
          this.setContext(jsonData.body);

          if (jsonData.body.illustType === 0) {
            resolve(IllustrationDownloader.createFromWorkDownloader(this)); //
          } else if (jsonData.body.illustType === 1) {
            resolve(MangaDownloader.createFromWorkDownloader(this));
          } else {
            reject(Error(`unsupported work type '${jsonData.body.illustType}'`))
          }
        });

        response.on('error', error => {
          reject(error);
        })
      });

      this.request.on('abort', () => {
        //
      });

      this.request.on('error', error => {
        reject(error);
      });

      this.request.end();
    });
  }

  /**
   * Stop downloader
   */
  stop() {
    this.request.abort();
  }
}

export default UndeterminedDownloader;
