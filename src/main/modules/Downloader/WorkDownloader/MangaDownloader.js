import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import UrlBuilder from '@/../utils/UrlBuilder';
import Request from '@/modules/Request';
import Download from '@/modules/Download';

/**
 * @class
 */
class MangaDownloader extends WorkDownloader {
  constructor() {
    super();

    this.download = null;

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
   * @returns {Promise<MangaDownloader>}
   */
  static createFromWorkDownloader(workDownloader) {
    return new Promise((resolve, reject) => {
      let url = UrlBuilder.getWorkPagesUrl(workDownloader.id);

      let request = new Request({
        url: url,
        method: 'GET'
      });

      request.on('error', error => {
        reject(error);
      });

      request.on('response', response => {
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
            let downloader = new MangaDownloader();
            downloader.id = workDownloader.id;
            downloader.options = workDownloader.options;
            downloader.context = workDownloader.context;
            downloader.images = jsonData.body;

            resolve(downloader);

            return;
          }

          reject(Error('Cannot resolve manga images'));
        });

        response.on('aborted', () => {
          reject(Error('Resolve manga images has been aborted'));
        });
      });

      request.end();
    });
  }

  downloadImages() {
    let url = this.images[this.imageIndex].urls.original;

    let downloadOptions = Object.assign({}, this.options, {url: url});

    this.download = new Download(downloadOptions);

    this.download.on('dl-finish', () => {
      this.imageIndex++;

      this.progress = this.imageIndex / this.images.length

      this.emit('progress', { downloader: this });

      if (this.imageIndex > (this.images.length - 1)) {
        this.state = MangaDownloader.state.finish;

        this.emit('finish', { downloader: this });
        return;
      }

      this.downloadImages();
    });

    this.download.on('dl-error', error => {
      this.state = MangaDownloader.state.error;
      this.statusMessage = error.message;

      this.emit('error', { downloader: this });
    });

    this.download.on('dl-aborted', () => {
      this.state = MangaDownloader.state.stop;

      this.emit('stop', { downloader: this });
    });

    this.download.download();
  }

  start() {
    this.emit('start', { downloader: this });

    this.state = MangaDownloader.state.downloading;

    this.downloadImages();
  }

  stop() {
    this.state = MangaDownloader.state.stop;

    this.download.abort();
  }

  destroy() {
    this.stop();
  }

  toJSON() {
    let data = super.toJSON();

    data.total = this.images.length;
    data.complete = this.imageIndex;

    return data;
  }
}

export default MangaDownloader;
