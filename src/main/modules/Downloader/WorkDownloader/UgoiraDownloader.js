import fs from 'fs-extra';
import path from 'path';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import UrlBuilder from '@/../utils/UrlBuilder';
import Request from '@/modules/Request';
import Download from '@/modules/Download';
import FormatName from '@/modules/Utils/FormatName';
import SettingStorage from '@/modules/SettingStorage';
import Zip from 'jszip';
import cluster from 'cluster';

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
   * Create ugoira downloader from base work downloader
   * @member
   * @param {WorkDownloader} workDownloader
   * @returns {UgoiraDownloader}
   */
  static createFromWorkDownloader(workDownloader) {
    let downloader = new UgoiraDownloader();
    downloader.id = workDownloader.id;
    downloader.options = workDownloader.options;
    downloader.context = workDownloader.context;

    /**
      * Append work folder at the end
      */
    downloader.options.saveTo = path.join(downloader.options.saveTo, FormatName.format(SettingStorage.getSetting('ugoiraRename'), downloader.context));

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

          if (jsonData &&
            jsonData.body &&
            jsonData.body.originalSrc &&
            Array.isArray(jsonData.body.frames) &&
            jsonData.body.frames.length > 0
          ) {
            resolve(jsonData.body);
            return;
          }

          reject(Error('Cannot resolve ugoira meta'));
        });

        response.on('aborted', () => {
          reject(Error('Resolve ugoira meta has been aborted'));
        });
      });

      this.request.end();
    });
  }

  generateGif(file) {
    this.setDownloading('Generating GIF');

    cluster.setupMaster({
      exec: "./dist/main/UgoiraDownloaderGifEncoderWorker.js"
    });

    const worker = cluster.fork();

    worker.on('message', data => {
      if (data.status === 'finish') {
        worker.kill();
      }
    });
//
    worker.send({
      file,
      saveFile: path.join(this.download.saveTo, FormatName.format(SettingStorage.getSetting('ugoiraRename'), this.context)) + '.gif'
    });
  }

  packFramesInfo(file) {
    this.setDownloading('Packing frames infomation');

    fs.readFile(file).then(data => {
      Zip.loadAsync(data).then(zip => {
        zip.file('animation.json', JSON.stringify(this.meta.frames));

        zip.generateNodeStream({
          type: 'nodebuffer',
          streamFiles: true
        }).pipe(fs.createWriteStream(file))
          .on('finish', () => {
            this.generateGif(file);
          });
      });
    });
  }

  downloadZip() {
    const url = this.meta.originalSrc;

    let downloadOptions = Object.assign({},
      this.options,
      {
        url: url,
        saveName: FormatName.format(SettingStorage.getSetting('ugoiraRename'), this.context)
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
