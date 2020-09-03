import FormatName from '@/modules/Utils/FormatName';
import MangaDownloader from '@/modules/Downloader/WorkDownloader/MangaDownloader'
import SettingStorage from '@/modules/SettingStorage';
import path from 'path';

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
