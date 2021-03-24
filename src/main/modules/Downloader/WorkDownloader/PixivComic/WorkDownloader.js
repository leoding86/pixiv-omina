import Request from '@/modules/Request';
import BaseWorkDownloader from '@/modules/Downloader/WorkDownloader';
import WorkProvider from '@/modules/Downloader/Providers/PixivComic/WorkProvider';
import DownloadAdapter from '../../DownloadAdapter';

class WorkDownloader extends BaseWorkDownloader {
  constructor() {
    super();

    this.type = 'Pixiv Comic work';
  }

  /**
   *
   * @param {{ url: string, saveTo: string, options: object, provider: WorkProvider }} param0
   */
  static createDownloader({ url, saveTo, options, provider }) {
    let downloader = new WorkDownloader();
    downloader.id = provider.id;
    downloader.url = url;
    downloader.saveTo = saveTo;
    downloader.options = options;
    downloader.provider = provider;

    return downloader;
  }

  /**
   *
   * @param {number} id
   * @returns {string}
   */
  getEpisodeDataUrl(id) {
    return `https://comic.pixiv.net/api/app/episodes/${id}/read`;
  }

  /**
   *
   * @returns {string}
   */
  getWorkDataUrl(id) {
    return `https://comic.pixiv.net/api/app/works/v3/${id}`;
  }

  /**
   *
   * @returns {void}
   */
  addDownloaders() {
    return new Promise((resolve, reject) => {
      this.request = new Request({
        url: this.getWorkDataUrl(this.provider.context.id),
        method: 'GET'
      });

      this.request.on('response', response => {
        if (response.statusCode !== 200) {
          reject(Error(`request failed ${response.statusCode}`));
        } else {
          let body = '';

          response.on('data', data => {
            body += data;
          });

          response.on('end', () => {
            let jsonData = JSON.parse(body.toString());

            if (jsonData && jsonData.data && jsonData.data.official_work && jsonData.data.official_work.stories) {
              this.context.userName = jsonData.data.official_work.author;

              jsonData.data.official_work.stories.forEach(story => {
                if (!!story.readable) {
                  let url = `https://comic.pixiv.net/viewer/stories/${story.story.id}`;

                  let provider = DownloadAdapter.getProvider(url),
                      downloader = provider.createDownloader({
                        saveTo: this.saveTo,
                        options: this.options
                      });

                  Object.assign(downloader.context, this.context);

                  this.downloadManager.addDownloader(downloader);
                }
              });

              resolve(this.context);
            } else {
              reject(Error('cannot resolve episodes data'));
            }
          });

          response.on('error', error => {
            reject(error);
          });
        }
      });

      this.request.on('error', error => {
        reject(error);
      });

      this.request.end();
    });
  }

  /**
   * Start download
   * @returns {void}
   */
  start() {
    this.setStart();

    this.addDownloaders().then(() => {
      this.setFinish();
      this.downloadManager.deleteDownload({ downloadId: this.id });
    }).catch(error => {
      this.setError(error);
    });
  }
}

export default WorkDownloader;
