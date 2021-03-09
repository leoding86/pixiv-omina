import BaseProvider from './BaseProvider';
import Request from '@/modules/Request';

class NovelProvider extends BaseProvider {
  /**
   *
   * @param {object} options
   * @param {string} options.url
   * @param {object} options.context
   * @param {string|number} options.context.id
   * @returns {UserProvider}
   */
  static createProvider({ url, context }) {
    return new NovelProvider({ url, context });
  }

  /**
   * @returns {string}
   */
  get id() {
    return [this.providerName, 'novel', this.context.id].join(':');
  }

  /**
   * Get user profile all url
   * @returns {string}
   */
  getNovelUrl() {
    return `https://www.pixiv.net/ajax/novel/${this.context.id}`;
  }

  /**
   * @returns {Promise.<string[],Error>}
   */
  requestNovel() {
    return new Promise((resolve, reject) => {
      this.request = new Request({
        url: this.getNovelUrl(),
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
            reject(Error('cannot resolve novel data'));
          } else {
            this.context = jsonData.body;
            resolve(jsonData.body);
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
}

export default NovelProvider;
