import Request from '@/modules/Request';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import IllustrationDownloader from '@/modules/Downloader/WorkDownloader/IllustrationDownloader';
import MangaDownloader from '@/modules/Downloader/WorkDownloader/MangaDownloader';
import UgoiraDownloader from '@/modules/Downloader/WorkDownloader/UgoiraDownloader';
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
  }

  /**
   * @returns {Promise<WorkDownloader>}
   */
  getRealDownloader() {
    this.setStart('Resovling downloader');

    return new Promise((resolve, reject) => {
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
            let error = Error('cannot resolve work info');

            this.setError(error);

            reject(error);
            return;
          }

          /**
           * Set work info as context to downloader
           */
          this.setContext(jsonData.body);

          if (jsonData.body.illustType === 0) {
            resolve(IllustrationDownloader.createFromWorkDownloader(this));
          } else if (jsonData.body.illustType === 1) {
            resolve(MangaDownloader.createFromWorkDownloader(this));
          } else if (jsonData.body.illustType === 2) {
            resolve(UgoiraDownloader.createDownloader(this));
          } else {
            let error = Error(`unsupported work type '${jsonData.body.illustType}'`);

            this.setError(error);

            reject(error.message);
          }
        });

        response.on('error', error => {
          this.setError(error);

          reject(error);
        })
      });

      this.request.on('abort', () => {
        this.setStop();

        reject();
      });

      this.request.on('error', error => {
        this.setError(error);

        reject(error);
      });

      this.request.end();
    });
  }

  reset() {
    // ignore but must have it
  }

  /**
   * Stop downloader
   */
  stop() {
    if (this.request) {
      this.request.abort();
    }
  }
}

export default UndeterminedDownloader;
