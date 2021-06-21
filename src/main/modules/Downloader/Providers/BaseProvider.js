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
     * @type {string}
     */
    this.providerName = 'unkown';

    /**
     * @type {boolean}
     */
    this.provideMultipleDownloaders = false;

    /**
     * Set provider version
     * @type {number}
     */
    this.version = 1;
  }

  /**
   * Downloader will use this id as downloader's id
   * @returns {string}
   */
  get id() {
    return [this.providerName, this.context.id].join(':');
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

  /**
   * Create a downloader
   * @param {{ saveTo: string, options: object }} options
   * @throws {Error}
   */
  createDownloader({ saveTo, options }) {
    throw new Error(`Method "createDownloader" hasn't been implemented`);
  }
}

export default BaseProvider;
