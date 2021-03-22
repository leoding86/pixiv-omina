import path from 'path';
import fs from 'fs-extra';
import SettingStorage from '@/modules/SettingStorage';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import NovelProvider from '@/modules/Downloader/Providers/Pixiv/NovelProvider';

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

    this.type = 'Pixiv Novel';
  }

  get title() {
    return this.context.title;
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
