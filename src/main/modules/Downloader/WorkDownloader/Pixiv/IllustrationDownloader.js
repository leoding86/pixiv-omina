import MangaDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/MangaDownloader'
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
  }

  /**
   * @returns {this}
   */
  makeSaveOption() {
    return this.makeSaveOptionFromRenameTemplate(SettingStorage.getSetting('illustrationRename'));
  }
}

export default IllustrationDownloader;
