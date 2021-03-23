import BaseProvider from './BaseProvider';
import Request from '@/modules/Request';
import DateFormatter from '@/../utils/DateFormatter';
import IllustrationDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/IllustrationDownloader';
import MangaDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/MangaDownloader';
import UgoiraDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/UgoiraDownloader';
import DownloadManager from '@/modules/Downloader/DownloadManager';
import IllustrationProvider from '@/modules/Downloader/Providers/Pixiv/IllustrationProvider';
import MangaProvider from '@/modules/Downloader/Providers/Pixiv/MangaProvider';
import UgoiraProvider from '@/modules/Downloader/Providers/Pixiv/UgoiraProvider';
import GeneralArtworkDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/GeneralArtworkDownloader';

class GeneralArtworkProvider extends BaseProvider {
  /**
   * @constructor
   * @param {{url: string, context: any}} args
   */
  constructor({ url, context }) {
    super({ url, context });

    /**
     * @inheritdoc
     */
    this.version = 2;
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
   * @param {{url: String, saveTo: String, types: Object}} options
   * @returns {GeneralArtworkDownloader}
   */
  createDownloader({ url, saveTo, types }) {
    return GeneralArtworkDownloader.createDownloader({ url, saveTo, types, provider: this });
  }
}

export default GeneralArtworkProvider;
