import Download from '@/modules/Download';
import FormatName from '@/modules/Utils/FormatName';
import SettingStorage from '@/modules/SettingStorage';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import path from 'path';
import fs from 'fs-extra';
import { PixivNovelProvider as NovelProvider } from '@/modules/Downloader/Providers';

/**
 * @class
 */
class NovelDownloader extends WorkDownloader {

  /**
   * @constructor
   */
  constructor() {
    super();

    this.meta = null;

    /**
     * @type {NovelProvider}
     */
    this.provider = null;

    this.type = 4;
  }

  /**
   * Create downloader
   * @param {{provider: NovelProvider, options: Object}} param0
   */
  static createDownloader({provider, options}) {
    let downloader = new NovelDownloader();
    downloader.provider = provider;
    downloader.url = provider.url;
    downloader.id = provider.id;
    downloader.options = options;
    downloader.context = provider.context;
    return downloader;
  }

  /**
   * Start downloader
   */
  start() {
    this.setStart();

    this.makeSaveOptionFromRenameTemplate(SettingStorage.getSetting('novelRename'));

    this.savedTarget = path.join(this.saveFolder, this.saveFilename) + '.txt';

    fs.ensureFileSync(this.savedTarget);
    fs.writeFileSync(this.savedTarget, this.context.content);

    this.setFinish();
  }

  /**
   * Stop downloader
   */
  stop() {
    this.setStop();
  }
}

export default NovelDownloader;
