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
    this.providerName = 'pixivcomic';
  }
}

export default BaseProvider;
