import RootBaseProvider from '@/modules/Downloader/Providers/BaseProvider';

class BaseProvider extends RootBaseProvider {
  /**
   * @constructor
   * @param {{ url: string, context: any }} options
   */
  constructor({ url, context }) {
    super({ url, context })

    /**
     * @type {string}
     */
    this.providerName = 'pixiv';
  }
}

export default BaseProvider;
