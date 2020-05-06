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

  getImageSaveName() {
    return FormatName.format(SettingStorage.getSetting('illustrationImageRename'), this.context);
  }

  getImageSaveFolderName() {
    return FormatName.format(SettingStorage.getSetting('illustrationRename'), this.context);
  }

  /**
   * @override
   * @returns {String}
   */
  getRelativeSaveFolder() {
    return FormatName.format(SettingStorage.getSetting('saveIllustrationToRelativeFolder'), this.context, null, { mode: 'folder' });
  }

  /**
   * @override
   * @returns {String}
   */
  getImageSaveFolder() {
    return path.join(
      this.options.saveTo,
      this.getRelativeSaveFolder(),
      this.saveInSubfolder ? this.getImageSaveFolderName() : ''
    )
  }
}

export default IllustrationDownloader;
