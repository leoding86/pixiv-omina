import Download from '@/modules/Download';
import FormatName from '@/modules/Utils/FormatName';
import Request from '@/modules/Request';
import SettingStorage from '@/modules/SettingStorage';
import UrlBuilder from '@/../utils/UrlBuilder';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import WorkDownloaderUnstoppableError from '../WorkDownloaderUnstoppableError';
import Zip from 'jszip';
import { app } from 'electron';
import { debug } from '@/global';
import { fork } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

const isDevelopment = process.env.NODE_ENV !== 'production'

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

    this.workers = [];
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

    return downloader;
  }

  /**
   * @override
   * @returns {String}
   */
  getRelativeSaveFolder() {
    return FormatName.format(SettingStorage.getSetting('saveUgoiraToRelativeFolder'), this.context, null, { mode: 'folder' });
  }

  /**
   * @override
   * @returns {String}
   */
  getImageSaveFolder() {
    return path.join(this.options.saveTo, this.getRelativeSaveFolder())
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
    debug.sendStatus(`Generating ${this.id} GIF`);

    this.setDownloading('Generating GIF');

    let gifSaveFile = this.savedTarget = path.join(this.download.saveTo, FormatName.format(SettingStorage.getSetting('ugoiraRename'), this.context)) + '.gif';

    /**
     * Check if the gif file has been generated
     */
    if (fs.existsSync(gifSaveFile)) {
      this.setFinish(`Gif has been generated, skip`);

      this.progress = 1;
      return;
    }

    let workPath = path.join(app.getAppPath(), 'UgoiraDownloaderGifEncoderWorker.js');
    let worker;

    if (fs.existsSync(workPath)) {
      worker = fork(workPath);
    } else {
      worker = fork(path.join(process.resourcesPath, 'app.asar', 'UgoiraDownloaderGifEncoderWorker.js'));
    }

    /**
     * Push the worker to workers pool
     */
    this.workers.push(worker);

    worker.on('message', data => {
      if (this.recycle) {
        return;
      }

      if (data.status === 'finish') {
        worker.kill();

        this.setFinish();

        debug.sendStatus(`Generate GIF ${this.id} complete`);
      } else if (data.status === 'progress') {
        this.progress = 0.5 + (data.progress / 2);

        this.setProcessing(`Generating Gif ${this.progress * 100}%`);

        debug.sendStatus(`Generate GIF ${this.id} progress ${data.progress}`);
      }
    });

    worker.send({
      file,
      saveFile: gifSaveFile
    });
  }

  packFramesInfo(file) {
    this.setProcessing('Packing frames infomation');

    debug.sendStatus(`Packing frames information to ${this.id}`);

    fs.readFile(file).then(data => {
      Zip.loadAsync(data).then(zip => {
        zip.file('animation.json', JSON.stringify(this.meta.frames));

        zip.generateNodeStream({
          type: 'nodebuffer',
          streamFiles: true
        }).pipe(fs.createWriteStream(file))
          .on('finish', () => {
            debug.sendStatus(`${this.id} frames information packed`);

            this.generateGif(file);
          });
      }).catch(error => {
        this.setError(error);
      });
    }).catch(error => {
      this.setError(error);
    });
  }

  downloadZip() {
    const url = this.meta.originalSrc;

    let downloadOptions = Object.assign({},
      this.options,
      {
        url: url,
        saveTo: this.getImageSaveFolder(),
        saveName: FormatName.format(SettingStorage.getSetting('ugoiraRename'), this.context)
      }
    );

    this.download = new Download(downloadOptions);

    this.download.on('dl-finish', ({ file }) => {
      if (!this.savedTarget) {
        this.savedTarget = file;
      }

      this.progress = this.download.progress / 2;
      this.setDownloading();

      this.packFramesInfo(this.download.getSavedFile());
    });

    this.download.on('dl-progress', () => {
      this.progress = this.download.progress / 2;
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

  /**
   * Kill all workers
   */
  killWorkers() {
    this.workers.forEach(worker => {
      worker.kill();
    });
  }

  /**
   * Check if the downloader can be stopped
   * @override
   */
  isStoppable() {
    return !this.isStopping();
  }

  /**
   * Stop the downloader
   * @override
   * @param {Object} options
   * @param {Boolean} [options.mute=false]
   * @throws {WorkDownloaderUnstoppableError}
   */
  stop(options) {
    if (!this.isStoppable()) {
      throw new WorkDownloaderUnstoppableError('WorkDownloader cannot be stopped');
    }

    let { mute = false } = Object.assign({}, options);//

    this.setMute(mute);

    this.setStopping();

    this.download && this.download.abort();
    this.request && this.request.abort();

    /**
     * Kill workers
     */
    this.killWorkers();

    this.setStop();

    /**
     * Enable firing events again
     */
    mute === true && this.setMute(false);
  }
}

export default UgoiraDownloader;
