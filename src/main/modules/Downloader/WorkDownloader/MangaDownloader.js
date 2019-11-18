import WorkDownloader from '@/modules/Downloader/WorkDownloader'

/**
 * @class
 */
class MangaDownloader extends WorkDownloader {
  /**
   * Create a manga downloader from base work downloader
   * @member
   * @param {WorkDownloader} workDownloader
   */
  static createFromWorkDownloader(workDownloader) {
    let downloader = new IllustrationDownloader();
    downloader.id = workDownloader.id;
    downloader.options = workDownloader.options;
  }
}

export default MangaDownloader;
