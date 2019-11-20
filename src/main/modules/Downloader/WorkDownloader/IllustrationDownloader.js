import WorkDownloader from '@/modules/Downloader/WorkDownloader'

/**
 * @class
 */
class IllustrationDownloader extends WorkDownloader {
  /**
   * @constructor
   */
  constructor() {
    super();

    this.download = null;

    this.images = [];

    this.imageIndex = 0;

    this.type = 2;
  }

  /**
   * Create a illustration downloader form base work downloader
   * @member
   * @param {WorkDownloader} workDownloader
   */
  static createFromWorkDownloader(workDownloader) {
    throw Error('not implemented');
  }
}

export default IllustrationDownloader;
