import BaseProvider from './BaseProvider';
import GeneralArtworkDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/GeneralArtworkDownloader';

class GeneralArtworkProvider extends BaseProvider {
  /**
   * @constructor
   * @param {{url: string, context: any}} args
   */
  constructor({ url, context }) {
    super({ url, context });
  }

  /**
   * Downloader will use this id as downloader's id
   * @returns {string}
   */
  get id() {
    return [this.providerName, 'artwork', this.context.id];
  }

  /**
   * @param {object} options
   * @param {string} options.url
   * @param {object} options.context
   * @param {string|number} options.context.id
   * @returns {GeneralArtworkProvider}
   */
  static createProvider({ url, context }) {
    return new GeneralArtworkProvider({ url, context });
  }

  /**
   * @returns {string}
   */
  get id() {
    return [this.providerName, this.context.id].join(':');
  }

  /**
   * Create a downloader
   * @param {{saveTo: string, options: object}} options
   * @returns {GeneralArtworkDownloader}
   */
  createDownloader({ saveTo, options }) {
    return GeneralArtworkDownloader.createDownloader({
      url: this.url,
      saveTo,
      options,
      provider: this
    });
  }
}

export default GeneralArtworkProvider;
