import { net, session } from 'electron';

/**
 * @class
 */
class Request extends net.ClientRequest {
  /**
   * @constructor
   * @param {Object} options
   * @param {string} options.url
   * @param {Electron.Session} options.session
   * @param {string} options.partition
   */
  constructor(options, callback) {
    options = Object.assign({}, Request.globalOptions, options);

    super(options, callback);

    this.options = options;

    /**
     * Merge options
     */
    this.options = options;
  }

  static globalOptions = {};

  static setGlobalOptions(options) {
    Request.globalOptions = options;
  }

  /**
   *
   * @param {string|Buffer} [chunk]
   * @param {string} [encoding]
   * @param {Function} [callback]
   */
  end(chunk, encoding, callback) {
    let matches = this.options.url.match(/^(https?:\/{2}[^/]+)/);
    let ses;

    if (this.options && (this.options.session || this.options.partition)) {
      if (this.options.session) {
        ses = this.options.session;
      } else if (this.options.partition) {
        ses = session.fromPartition(this.options.partition);
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
