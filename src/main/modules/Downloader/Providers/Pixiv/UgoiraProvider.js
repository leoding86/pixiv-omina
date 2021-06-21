import BaseProvider from '@/modules/Downloader/Providers/BaseProvider';

class UgoiraProvider extends BaseProvider {

  /**
   *
   * @param {object} options
   * @param {string} options.url
   * @param {object} options.context
   * @param {string|number} options.context.id
   * @returns {UgoiraProvider}
   */
  static createProvider({ url, context }) {
    return new UgoiraProvider({ url, context });
  }

  /**
   * Get downloader's id
   */
  get id() {
    return [this.providerName, this.context.id].join(':');
  }
}

export default UgoiraProvider;
