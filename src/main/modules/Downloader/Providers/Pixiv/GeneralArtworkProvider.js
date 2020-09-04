import BaseProvider from './BaseProvider';
import Request from '@/modules/Request';
import DateFormatter from '@/../utils/DateFormatter';

class GeneralArtworkProvider extends BaseProvider {

  /**
   * @param {object} options
   * @param {string} options.url
   * @param {object} options.context
   * @param {string|number} options.context.id
   * @returns {GeneralArtworkProvider}
   */
  static createProvider({ url, context }) {
    return new GeneralArtworkProvider({ url, context });
  }

  /**
   * @returns {string}
   */
  get id() {
    return [this.providerName, this.context.id].join(':');
  }

  /**
   * Get artwork info url
   * @returns {string}
   */
  getInfoUrl() {
    return `https://www.pixiv.net/ajax/illust/${this.context.id}`;
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
}

export default GeneralArtworkProvider;
