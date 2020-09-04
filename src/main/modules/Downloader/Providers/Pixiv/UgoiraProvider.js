import GeneralArtworkProvider from './GeneralArtworkProvider';
import Request from '@/modules/Request';

class UgoiraProvider extends GeneralArtworkProvider {

  /**
   *
   * @param {object} options
   * @param {string} options.url
   * @param {object} options.context
   * @param {string|number} options.context.id
   * @returns {UgoiraProvider}
   */
  static createProvider({ url, context }) {
    return new UgoiraProvider({ url, context });
  }

  /**
   * Get ugoira meta url
   * @returns {string}
   */
  getMetaUrl() {
    return `https://www.pixiv.net/ajax/illust/${this.context.id}/ugoira_meta`;
  }

  /**
   * @returns {Promise.<Object,Error>}
   */
  requestMeta() {
    return new Promise((resolve, reject) => {
      this.request = new Request({
        url: this.getMetaUrl(),
        method: 'GET'
      });

      this.request.on('error', error => {
        reject(error);
      });

      this.request.on('abort', () => {
        reject(Error('Request ugoira meta has been aborted'));
      });

      this.request.on('response', response => {
        if (response.statusCode !== 200) {
          reject(Error(response.statusCode));
        } else {
          let body = '';

          response.on('error', error => {
            reject(error);
          });

          response.on('data', data => {
            body += data;
          });

          response.on('end', () => {
            let jsonData = JSON.parse(body.toString());

            if (jsonData &&
              jsonData.body &&
              jsonData.body.originalSrc &&
              Array.isArray(jsonData.body.frames) &&
              jsonData.body.frames.length > 0
            ) {
              resolve(jsonData.body);
              return;
            } else {
              reject(Error('Cannot resolve ugoira meta'));
            }
          });

          response.on('aborted', () => {
            reject(Error('Resolve ugoira meta has been aborted'));
          });
        }
      });

      this.request.end();
    });
  }
}

export default UgoiraProvider;
