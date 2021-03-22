import BaseProvider from './BaseProvider';
import Request from '@/modules/Request';
import UndeterminedDownloader from '@/modules/Downloader/WorkDownloader/UndeterminedDownloader';
import GeneralArtworkProvider from '@/modules/Downloader/Providers/Pixiv/GeneralArtworkProvider';

class UserProvider extends BaseProvider {
  constructor() {
    super();

    this.provideMultipleDownloaders = true;
  }

  /**
   *
   * @param {object} options
   * @param {string} options.url
   * @param {object} options.context
   * @param {string|number} options.context.id
   * @returns {UserProvider}
   */
  static createProvider({ url, context }) {
    return new UserProvider({ url, context });
  }

  /**
   * @returns {string}
   */
  get id() {
    return [this.providerName, 'user', this.context.id].join(':');
  }

  /**
   * Get user profile all url
   * @returns {string}
   */
  getProfileAllUrl() {
    return `https://www.pixiv.net/ajax/user/${this.context.id}/profile/all`;
  }

  getArtworkUrl(id) {
    return `https://www.pixiv.net/artworks/${id}`
  }

  /**
   * @returns {Promise.<string[],Error>}
   */
  requestAllWorks() {
    return new Promise((resolve, reject) => {
      this.request = new Request({
        url: this.getProfileAllUrl(),
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
            let workIds = [];

            Object.keys(jsonData.body.illusts).forEach(id => {
              workIds.push(id);
            });

            Object.keys(jsonData.body.manga).forEach(id => {
              workIds.push(id);
            });

            resolve(workIds);
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
   * @inheritdoc
   * @param {Object} options
   * @returns {UndeterminedDownloader[]}
   */
  getDownloaders(options) {
    return new Promise(resolve => {
      return this.requestAllWorks().then(workIds => {
        let downloaders = [];
        workIds.forEach(id => {
          downloaders.push(UndeterminedDownloader.createDownloader({
            provider: GeneralArtworkProvider.createProvider({
              url: this.getArtworkUrl(id),
              context: {
                id
              }
            }),
            options
          }))
        });

        resolve(downloaders);
      });
    });
  }
}

export default UserProvider;
