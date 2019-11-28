import { net, session } from 'electron';
import { debug } from '@/global';

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

    /**
     * Cannot use this reference before super called
     */
    this.options = options;

    this.on('login', (proxyInfo, cb) => {
      if (proxyInfo.isProxy) {
        let username = this.options.proxyUsername || '',
            password = this.options.proxyPassword || '';

        if (typeof username === 'string' && typeof password === 'string') {
          cb(username, password);
        }
      }
    });

    this.on('response', response => {
      debug.sendStatus(`Get response from ${this.options.url}`);

      response.on('data', () => {
        debug.sendStatus(`Receiving data from ${this.options.url}`);
      });

      response.on('aborted', () => {
        debug.sendStatus(`Abort receive data from ${this.options.url}`);
      });

      response.on('error', error => {
        debug.sendStatus(`Error ${error.message} occured while receiving data from ${this.options.url}`);
      });

      response.on('end', () => {
        debug.sendStatus(`All data received while recieving data from ${this.options.url}`);
      });
    });

    this.on('close', () => {
      debug.sendStatus(`Request ${this.options.url} closed`);
    });

    this.on('error', error => {
      debug.sendStatus(`Request ${this.options.url} error ${error.message}`);
    });

    this.on('finish', () => {
      debug.sendStatus(`Request ${this.options.url} finished`);
    });
  }

  static globalOptions = {};

  static setGlobalOptions(options) {
    Request.globalOptions = options;
  }

  static updateGlobalOptions(options) {
    Object.keys(options).forEach(key => {
      Request.globalOptions[key] = options[key];
    });
  }

  static removeGlobalOptions(optionKeys) {
    optionKeys.forEach(key => {
      if (typeof Request.globalOptions[key] !== undefined) {
        delete Request.globalOptions[key];
      }
    });
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
