import fs from 'fs-extra';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import UrlBuilder from '@/../utils/UrlBuilder';
import Request from '@/modules/Request';
import Download from '@/modules/Download';
import FormatName from '@/modules/Utils/FormatName';
import SettingStorage from '@/modules/SettingStorage';
import Zip from 'jszip';

/**
 * @class
 */
class UgoiraDownloader extends WorkDownloader {
  /**
   * @constructor
   */
  constructor() {
    super();

    this.meta = null;

    this.type = 2;
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
    let downloader = new UgoiraDownloader();
    downloader.id = workDownloader.id;
    downloader.options = workDownloader.options;
    downloader.context = workDownloader.context;

    /**
      * Append work folder at the end
      */
    downloader.options.saveTo = path.join(downloader.options.saveTo, FormatName.format(SettingStorage.getSetting('renameUgoira'), this.context));

    return downloader;
  }

  fetchMeta() {
    return new Promise((resolve, reject) => {
      const url = UrlBuilder.getUgoiraMetaUrl(this.id);

      this.request = new Request({
        url: url,
        method: 'GET'
      });

      this.request.on('error', error => {
        reject(error);
      });

      this.request.on('abort', () => {
        reject(Error('Request ugoira meta has been aborted'));
      });

      this.request.on('response', response => {
        if (response.statusCode !== 200) {
          reject(Error(response.statusCode));
          return;
        }

        let body = '';

        response.on('error', error => {
          reject(error);
        });

        response.on('data', data => {
          body += data;
        });

        response.on('end', () => {
          let jsonData = JSON.parse(body.toString());

          if (jsonData && jsonData.originalSrc && Array.isArray(jsonData.frames) && jsonData.frames.length > 0) {
            resolve(jsonData.body);
            return;
          }

          reject(Error('Cannot resolve ugoira meta'));
        });

        response.on('aborted', () => {
          reject(Error('Resolve ugoira meta has been aborted'));
        });
      });
    });
  }

  generateGif(zip) {
    //
  }

  packFramesInfo(file) {
    //animation.json
    this.setDownloading('Pack frames infomation');

    fs.readFile(file).then(data => {
      Zip.loadAsync(data).then(zip => {
        zip.file('animation.json', JSON.stringify(this.meta.frames));

        this.generateGif(zip);
      });
    });
  }

  downloadZip() {
    const url = this.meta.originalSrc;

    let downloadOptions = Object.assign({},
      this.options,
      {
        url: url,
        saveName: FormatName.format(SettingStorage.getSetting('ugoiraRname'), this.context)
      }
    );

    this.download = new Download(downloadOptions);

    this.download.on('dl-finish', () => {
      this.setDownloading();

      this.packFramesInfo(this.download.getSavedFile());
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

  start() {
    this.setStart();

    if (!this.meta) {
      this.setDownloading('Fetch ugoira meta for downloading');

      this.fetchMeta().then(meta => {
        this.meta = meta;

        this.downloadZip();
      }).catch(error => {
        this.setError(error);
      });
    } else {
      this.setDownloading();

      this.downloadZip();
    }
  }

  stop() {
    super.stop();
  }
}

export default UgoiraDownloader;
