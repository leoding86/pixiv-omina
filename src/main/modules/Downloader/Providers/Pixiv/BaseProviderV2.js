import Request from '@/modules/Request';

class BaseProviderV2 {

  /**
   * @param {object} options
   */
  constructor() {
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
}

export default BaseProviderV2;
