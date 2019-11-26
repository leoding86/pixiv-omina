import path from 'path';
import FormatName from '@/modules/Utils/FormatName';
import SettingStorage from '@/modules/SettingStorage';
import MangaDownloader from '@/modules/Downloader/WorkDownloader/MangaDownloader'

/**
 * @class
 */
class IllustrationDownloader extends MangaDownloader {
  /**
   * @constructor
   */
  constructor() {
    super();

    this.download = null;

    this.images = [];

    this.imageIndex = 0;

    this.type = 0;
  }

  /**
   * Create a manga downloader from base work downloader
   * @member
   * @param {WorkDownloader} workDownloader
   * @returns {IllustrationDownloader}
   */
  static createFromWorkDownloader(workDownloader) {
    let downloader = new IllustrationDownloader();
    downloader.id = workDownloader.id;
    downloader.options = workDownloader.options;
    downloader.context = workDownloader.context;

    /**
     * Append work folder at the end
     */
    downloader.options.saveTo = path.join(downloader.options.saveTo, FormatName.format(SettingStorage.getSetting('illustrationRename'), downloader.context));

    return downloader;
  }

  getImageSaveName() {
    FormatName.format(SettingStorage.getSetting('illustrationImageRename'), this.context);
  }
}

export default IllustrationDownloader;
