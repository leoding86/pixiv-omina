import GeneralArtworkProvider from './GeneralArtworkProvider';
import Request from '@/modules/Request';

class MangaProvider extends GeneralArtworkProvider {

  /**
   *
   * @param {object} options
   * @param {string} options.url
   * @param {object} options.context
   * @param {string|number} options.context.id
   * @returns {MangaProvider}
   */
  static createProvider({ url, context }) {
    return new MangaProvider({ url, context });
  }

  /**
   * Get artwork pages url
   * @returns {string}
   */
  getPagesUrl() {
    return `https://www.pixiv.net/ajax/illust/${this.context.id}/pages`;
  }

  /**
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
}

export default MangaProvider;
