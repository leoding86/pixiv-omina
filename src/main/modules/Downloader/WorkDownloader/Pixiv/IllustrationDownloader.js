import MangaDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/MangaDownloader'
import SettingStorage from '@/modules/SettingStorage';
import IllustrationProvider from '@/modules/Downloader/Providers/Pixiv/IllustrationProvider';

/**
 * @class
 */
class IllustrationDownloader extends MangaDownloader {
  /**
   * @constructor
   */
  constructor() {
    super();

    /**
     * @type {IllustrationProvider}
     */
    this.provider;

    this.images = [];

    this.imageIndex = 0;

    this.type = 0;
  }

  /**
   *
   * @param {Object} options
   * @param {PixivMangaProvider} options.provider
   * @param {Object} options.options
   */
  static createDownloader({ provider, options }) {
    let downloader = new IllustrationDownloader();
    downloader.provider = provider;
    downloader.url = provider.url;
    downloader.id = provider.id;
    downloader.options = options;
    downloader.context = downloader.provider.context;

    return downloader;
  }

  /**
   * @returns {this}
   */
  makeSaveOption() {
    return this.makeSaveOptionFromRenameTemplate(SettingStorage.getSetting('illustrationRename'));
  }
}

export default IllustrationDownloader;
