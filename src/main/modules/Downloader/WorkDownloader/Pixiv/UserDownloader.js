import Request from '@/modules/Request';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import UserProvider from '../../Providers/Pixiv/UserProvider';
import DownloadAdapter from '@/modules/Downloader/DownloadAdapter';

class UserDownloader extends WorkDownloader {
  constructor() {
    super();

    /**
     * @type {string}
     */
    this.type = 'Pixiv User';

    /**
     * @type {UserProvider}
     */
    this.provider;
  }

  /**
   * Create a user downloader
   * @param {{ url: string, saveTo: string, options: object, provider: UserProvider }} args
   */
  static createDownloader({ url, saveTo, options, provider }) {
    let downloader = new UserDownloader();
    downloader.id = provider.id;
    downloader.url = url;
    downloader.saveTo = saveTo;
    downloader.options = options;
    downloader.provider = provider;

    return downloader;
  }

  /**
   * Get user profile all url
   * @param {number} id user id
   * @returns {string}
   */
  getProfileAllUrl(id) {
    return `https://www.pixiv.net/ajax/user/${id}/profile/all`;
  }

  getArtworkUrl(id) {
    return `https://www.pixiv.net/artworks/${id}`
  }

  /**
   * Add downloader to download manager
   * @param {number} id artwork id
   * @returns {void}
   */
  addDownloader(id) {
    let url = this.getArtworkUrl(id);

    /**
     * Get target downloader provider
     */
    let provider = DownloadAdapter.getProvider(url);

    /**
    * Add downloader to download manager
    */
    this.downloadManager.addDownloader(provider.createDownloader({
      url: this.getArtworkUrl(id),
      saveTo: this.saveTo,
      options: this.options
    }));
  }

  /**
   * @returns {Promise.<void,Error>}
   */
  createGeneralArtworkDownloaders() {
    return new Promise((resolve, reject) => {
      this.request = new Request({
        url: this.getProfileAllUrl(this.provider.context.id),
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
            reject(Error('cannot resolve user profile'));
          } else {
            Object.keys(jsonData.body.illusts).forEach(id => {
              this.addDownloader(id);
            });

            Object.keys(jsonData.body.manga).forEach(id => {
              this.addDownloader(id);
            });

            resolve();
          }
        });

        response.on('error', error => {
          reject(error);
        });

        response.on('aborted', () => {
          reject(Error('Response has been interrepted'));
        });
      });

      this.request.on('error', error => {
        reject(error);
      });

      this.request.on('abort', () => {
        reject(Error('Request has been interrepted'));
      });

      this.request.on('end', () => this.request = null);

      this.request.end();
    });
  }

  /**
   * Start downloader
   */
  start() {
    this.setStart();

    this.createGeneralArtworkDownloaders().then(() => {
      this.setFinish();
      this.downloadManager.deleteDownload({ downloadId: this.id });
    }).catch(error => {
      this.setError(error);
    });
  }
}

export default UserDownloader;
