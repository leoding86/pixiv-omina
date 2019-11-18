import WorkDownloader from '@/modules/Downloader/WorkDownloader'

/**
 * @class
 */
class IllustrationDownloader extends WorkDownloader {
  /**
   * Create a illustration downloader form base work downloader
   * @member
   * @param {WorkDownloader} workDownloader
   */
  static createFromWorkDownloader(workDownloader) {
    let downloader = new IllustrationDownloader();
    downloader.id = workDownloader.id;
    downloader.options = workDownloader.options;
  }
}

export default IllustrationDownloader;
