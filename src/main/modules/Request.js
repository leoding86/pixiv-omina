import { net, session } from 'electron';

/**
 * @class
 */
class Request extends net.ClientRequest {
  /**
   * @constructor
   * @param {Object} option
   * @param {string} option.url
   * @param {Electron.Session} option.session
   * @param {string} option.partition
   */
  constructor(option, callback) {
    super(option, callback);

    this.option = option;
  }

  /**
   *
   * @param {string|Buffer} [chunk]
   * @param {string} [encoding]
   * @param {Function} [callback]
   */
  end(chunk, encoding, callback) {
    let matches = this.option.url.match(/^(https?:\/{2}[^/]+)/);
    let ses;

    if (this.option && (this.option.session || this.option.partition)) {
      if (this.option.session) {
        ses = this.option.session;
      } else if (this.option.partition) {
        ses = session.fromPartition(this.option.partition);
      }

      let cookieString = '';

      ses.cookies.get({
        url: matches[1]
      }).then(cookies => {
        cookies.forEach(cookie => {
          cookieString += `${cookie.name}=${cookie.value}; `;
        });

        this.setHeader('cookie', cookieString);
        super.end(chunk, encoding, callback);
      });

      return;
    }

    super.end(chunk, encoding, callback);
  }
}

export default Request;
