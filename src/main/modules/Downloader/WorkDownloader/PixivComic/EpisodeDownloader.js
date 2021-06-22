import Download from '@/modules/Download';
import EpisodeProvider from '../../Providers/PixivComic/EpisodeProvider';
import Request from '@/modules/Request';
import SettingStorage from '@/modules/SettingStorage';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';

class EpisodeDownloader extends WorkDownloader {

  /**
   * @constructor
   */
  constructor() {
    super();

    this.type = 'Pixiv Comic episode';

    this.pageIndex = 0;

    this.tagColor = rgb(255, 196, 0);
  }

  /**
   * @param {{ url: string, saveTo: string, options: any, provider: EpisodeProvider }}
   * @returns {WorkDownloader}
   */
  static createDownloader({ url, saveTo, options, provider}) {
    let downloader = new EpisodeDownloader();

    downloader.id = provider.id;
    downloader.url = url;
    downloader.saveTo = saveTo;
    downloader.options = Object.assign({}, options);
    downloader.provider = provider;

    return downloader;
  }

  get title() {
    if (this.context) {
      return (this.context.workTitle ? (this.context.workTitle + ' ') : '') +
        (this.context.title ? this.context.title : this.context.id);
    } else {
      return this.id;
    }
  }

  /**
   * @returns {this}
   */
  makeSaveOption() {
    return this.makeSaveOptionFromRenameTemplate(SettingStorage.getSetting('pixivComicWorkRename'));
  }

  static getEpisodeUrl(id) {
    return `https://comic.pixiv.net/viewer/stories/${id}`;
  }

  getEpisodeDataUrl(id) {
    return `https://comic.pixiv.net/api/app/episodes/${id}/read`;
  }

  getWorkDataUrl(id) {
    return `https://comic.pixiv.net/api/app/works/v3/${id}`;
  }

  requestEpisodeData() {
    return new Promise((resolve, reject) => {
      this.request = new Request({
        url: this.getEpisodeDataUrl(this.provider.context.id),
        method: 'GET'
      });

      this.request.setHeader('x-referer', this.url);

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

            if (jsonData && jsonData.data && jsonData.data.reading_episode && jsonData.data.reading_episode.pages) {
              this.context.workId = jsonData.data.reading_episode.work_id;
              this.context.workTitle = jsonData.data.reading_episode.work_title;
              this.context.numberTitle = jsonData.data.reading_episode.numbering_title;
              this.context.subTitle = jsonData.data.reading_episode.sub_title;
              this.context.episodeTitle = jsonData.data.reading_episode.title;
              this.context.title = jsonData.data.reading_episode.title;
              this.context.pages = jsonData.data.reading_episode.pages;

              if (this.context.userName) {
                resolve(this.context);
              } else {
                resolve(this.requestWorkData());
              }
            } else {
              reject(Error('cannot resolve episode data'));
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

  requestWorkData() {
    return new Promise((resolve, reject) => {
      this.request = new Request({
        url: this.getWorkDataUrl(this.context.workId),
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

            if (jsonData && jsonData.data && jsonData.data.official_work) {
              this.context.userName = jsonData.data.official_work.author;
              resolve(this.context);
            } else {
              reject(Error('cannot resolve episode data'));
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

  downloadImages() {
    if (this.isStop() || this.isStopping()) {
      return;
    }

    let url = this.context.pages[this.pageIndex].url;

    /**
     * Must set pageNum property in context for make sure the rename image works correctly
     */
    this.context.pageNum = this.pageIndex;

    this.makeSaveOption();

    let downloadOptions = Object.assign(
      {},
      this.options,
      {
        url: url,
        saveTo: this.saveFolder,
        saveName: this.saveFilename
      }
    );

    this.download = new Download(downloadOptions);

    this.download.on('dl-finish', ({ file }) => {
      if (!this.savedTarget) {
        this.savedTarget = file;
      }

      this.pageIndex++;

      this.progress = this.pageIndex / this.context.pages.length;

      this.setDownloading();

      if (this.pageIndex > (this.context.pages.length - 1)) {
        this.setFinish();
        this.download = null;
        return;
      } else {
        this.downloadImages();
      }
    });

    this.download.on('dl-progress', () => {
      this.setDownloading(`downloading ${this.pageIndex} / ${this.context.pages.length}`);
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

  /**
   * @override
   */
  start() {
    this.setStart();

    if (!this.context || !this.context.pages) {
      this.setDownloading('_fetch_images');

      this.requestEpisodeData().then(() => {
        this.setDownloading();

        this.downloadImages();
      }).catch(error => {
        this.setError(error);
      });
    } else {
      this.setDownloading();

      this.downloadImages();
    }
  }
}

export default EpisodeDownloader;
