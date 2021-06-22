import MangaDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/MangaDownloader';
import SettingStorage from '@/modules/SettingStorage';

/**
 * @class
 */
class IllustrationDownloader extends MangaDownloader {
  /**
   * @constructor
   */
  constructor() {
    super();

    this.type = 'Pixiv Illustration';

    this.tagColor = 'rgb(226, 118, 118)';
  }

  /**
   * @returns {this}
   */
  makeSaveOption() {
    return this.makeSaveOptionFromRenameTemplate(SettingStorage.getSetting('illustrationRename'));
  }

  /**
   *
   * @param {{ url: string, saveTo: string, options: object, provider: GeneralArtworkProvider }} args
   */
  static createDownloader({ url, saveTo, options, provider }) {
    let downloader = new IllustrationDownloader();
    downloader.id = provider.id;
    downloader.url = url;
    downloader.saveTo = saveTo;
    downloader.options = options;
    downloader.provider = provider;

    return downloader;
  }
}

export default IllustrationDownloader;
