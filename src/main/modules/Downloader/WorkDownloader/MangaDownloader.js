import path from 'path';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import UrlBuilder from '@/../utils/UrlBuilder';
import Request from '@/modules/Request';
import Download from '@/modules/Download';
import FormatName from '@/modules/Utils/FormatName';
import SettingStorage from '@/modules/SettingStorage';

/**
 * @class
 */
class MangaDownloader extends WorkDownloader {
  constructor() {
    super();

    this.images = [];

    this.imageIndex = 0;

    this.type = 1;
  }

  /**
   * @override
   * @returns {string}
   */
  get title() {
    if (this.context) {
      return this.context.title
    }
    return super.title;
  }

  /**
   * Create a manga downloader from base work downloader
   * @member
   * @param {WorkDownloader} workDownloader
   * @returns {MangaDownloader}
   */
  static createFromWorkDownloader(workDownloader) {
    let downloader = new MangaDownloader();
    downloader.id = workDownloader.id;
    downloader.options = workDownloader.options;
    downloader.context = workDownloader.context;

    /**
     * Append work folder at the end
     */
    downloader.options.saveTo = path.join(downloader.options.saveTo, FormatName.format(SettingStorage.getSetting('mangaRename'), downloader.context));

    return downloader;
  }

  /**
   * Fetch images that need to be downloaded
   * @returns {Promise.<Array>}
   */
  fetchImages() {
    return new Promise((resolve, reject) => {
      let url = UrlBuilder.getWorkPagesUrl(this.id);

      this.request = new Request({
        url: url,
        method: 'GET'
      });

      this.request.on('error', error => {
        reject(error);
      });

      this.request.on('response', response => {
        let body = '';

        response.on('error', error => {
          reject(error);
        });

        response.on('data', data => {
          body += data;
        });

        response.on('end', () => {
          let jsonData = JSON.parse(body.toString());

          if (jsonData && Array.isArray(jsonData.body) && jsonData.body.length > 0) {
            resolve(jsonData.body);
            return;
          }

          reject(Error('Cannot resolve manga images'));
        });//

        response.on('aborted', () => {
          reject(Error('Resolve manga images has been aborted'));
        });
      });

      this.request.on('close', () => {
        this.request = null;
      });

      this.request.end();
    });
  }

  getImageSaveName() {
    FormatName.format(SettingStorage.getSetting('mangaImageRename'), this.context);
  }

  downloadImages() {
    let url = this.images[this.imageIndex].urls.original;

    /**
     * Must set pageNum property in context for make sure the rename image works correctly
     */
    this.context.pageNum = this.imageIndex;

    let downloadOptions = Object.assign(
      {},
      this.options,
      {
        url: url,
        saveName: this.getImageSaveName()
      }
    );

    this.download = new Download(downloadOptions);

    this.download.on('dl-finish', () => {
      this.imageIndex++;

      this.progress = this.imageIndex / this.images.length;

      this.setDownloading();

      if (this.imageIndex > (this.images.length - 1)) {
        this.setFinish();

        this.download = null;
        return;
      }

      this.downloadImages();
    });

    this.download.on('dl-progress', () => {
      this.setDownloading();
    });

    this.download.on('dl-error', error => {
      this.download = null;

      this.setError(error);
    });

    this.download.on('dl-aborted', () => {
      this.download = null;

      this.setStop();
    });

    this.download.download();
  }

  reset() {
    super.reset();
    this.images = [];
    this.imageIndex = 0;
  }

  start() {
    this.setStart();

    if (this.images.length === 0) {
      this.setDownloading('Fetch images that need to be downloaded');

      this.fetchImages().then(images => {
        this.images = images;

        this.downloadImages();
      }).catch(error => {
        this.setError(error);
      });
    } else {
      this.setDownloading();

      this.downloadImages();
    }
  }

  stop() {
    super.stop();
  }

  toJSON() {
    let data = super.toJSON();

    data.total = this.images.length;
    data.complete = this.imageIndex;

    return data;
  }
}

export default MangaDownloader;
