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

    this.type = 2;
  }
}

export default IllustrationDownloader;
