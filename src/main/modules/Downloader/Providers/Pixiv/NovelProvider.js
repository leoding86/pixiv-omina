import BaseProvider from './BaseProvider';
import Request from '@/modules/Request';
import NovelDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/NovelDownloader';

class NovelProvider extends BaseProvider {
  /**
   * @constructor
   * @param {{ url: string, context: any }} args
   */
  constructor({ url, context }) {
    super({ url, context });

    /**
     * @type {number}
     */
    this.version = 2;

    /**
     * @type {string}
     */
    this.providerName = 'pixiv-novel';
  }

  /**
   *
   * @param {object} options
   * @param {string} options.url
   * @param {object} options.context
   * @param {string|number} options.context.id
   * @returns {UserProvider}
   */
  static createProvider({ url, context }) {
    return new NovelProvider({ url, context });
  }

  /**
   * Downloader will use this id as downloader's id
   * @returns {string}
   */
  get id() {
    return [this.providerName, 'novel', this.context.id].join(':');
  }

  /**
   * Create a downloader
   * @param {{url: String, saveTo: String, types: Object}} args
   * @throws {Error}
   */
  createDownloader({ url, saveTo, types }) {
    return NovelDownloader.createDownloader({ url, saveTo, types, provider: this });
  }
}

export default NovelProvider;
