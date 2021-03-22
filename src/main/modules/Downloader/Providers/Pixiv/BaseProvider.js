import Request from '@/modules/Request';

class BaseProvider {

  /**
   * @param {object} options
   * @param {string} options.url
   * @param {object} options.context
   * @param {string|number} options.context.id
   */
  constructor({ url, context }) {
    /**
     * @type {string}
     */
    this.url = url;

    /**
     * @type {Object}
     */
    this.context = context;

    /**
     * @type {Request}
     */
    this.request = null;

    /**
     * @type {string}
     */
    this.providerName = 'pixiv';

    /**
     * @type {boolean}
     */
    this.provideMultipleDownloaders = false;
  }

  /**
   * Get downloader is provided by the provider
   * @param {Object} options
   * @throws {Error}
   */
  getDownloader(options) {
    throw new Error('Method "getDownloader" hasn\'t been implemented');
  }

  /**
   * Get downloader are provided by the provider
   * @param {Object} options
   * @throws {Error}
   */
  getDownloaders(options) {
    throw new Error('Method "getDownloaders" hasn\'t been implemented');
  }
}

export default BaseProvider;
