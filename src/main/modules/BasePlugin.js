import Exposer from '@/modules/Exposer';

class BasePlugin {
  /**
   * @constructor
   */
  constructor() {
    /**
     * @type {string}
     */
    this.entryFile = '';

    /**
     * @type {string}
     */
    this.id = '';

    /**
     * @property {RegExp[]}
     */
    this.patterns = [];

    /**
     * @property {string}
     */
    this.loginUrl = null;

    /**
     * @property {string}
     */
    this.icon = null;

    /**
     * @property {string}
     */
    this.title = null;

    /**
     * @property {RegExp[]}
     */
    this.requestUrlPatterns = [];
  }

  /**
   * Create a provider
   * @param {{ url: string, context: *}} param0
   */
  createProvider({ url, context }) {
    throw new Error('Method createProvider has not been implemented');
  }

  /**
   * Override request headers if necessary
   * @param {{ url: string, context: *, requestHeaders: object }} args
   * @returns {object}
   */
  requestHeadersOverrider({ url, context, requestHeaders }) {
    return requestHeaders;
  }

  /**
   * Override response header if necessary
   * @param {{ url: string, context: object, responseHeaders: object }} args
   * @returns {object}
   */
  responseHeadersOverrider({ url, context, responseHeaders }) {
    return responseHeaders;
  }
}

Exposer.expose('omina.BasePlugin', BasePlugin);

export default BasePlugin;
