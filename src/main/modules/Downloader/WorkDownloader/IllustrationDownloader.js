import FormatName from '@/modules/Utils/FormatName';
import MangaDownloader from '@/modules/Downloader/WorkDownloader/MangaDownloader'
import SettingStorage from '@/modules/SettingStorage';
import path from 'path';
import { PixivIllustrationProvider } from '../Providers';

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
     * @type {PixivIllustrationProvider}
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
   * @returns {String}
   */
  getImageSaveName() {
    return FormatName.format(SettingStorage.getSetting('illustrationRename').split('/').pop(), this.context);
  }

  /**
   * @override
   * @returns {String}
   */
  getImageSaveFolder() {
    let parts = SettingStorage.getSetting('illustrationRename').split('/');

    if (parts.length > 1) {
      parts.pop();
    }

    return path.join(this.options.saveTo, FormatName.format(parts.join('/'), this.context, null, { mode: 'folder' }), '/');
  }
}

export default IllustrationDownloader;
