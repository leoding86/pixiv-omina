import fs from 'fs-extra';
import path from 'path';
import Zip from 'jszip';
import { debug } from '@/global';
import TaskManager from '@/modules/TaskManager';
import UgoiraConvertTask from '@/modules/Task/UgoiraConvertTask';
import Request from '@/modules/Request';
import Download from '@/modules/Download';
import SettingStorage from '@/modules/SettingStorage';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import WorkDownloaderUnstoppableError from '../../WorkDownloaderUnstoppableError';
import UgoiraProvider from '@/modules/Downloader/Providers/Pixiv/UgoiraProvider';
import GeneralArtworkProvider from '@/modules/Downloader/Providers/Pixiv/GeneralArtworkProvider';

/**
 * @class
 */
class UgoiraDownloader extends WorkDownloader {
  /**
   * @constructor
   */
  constructor() {
    super();

    /**
     * The meta data from ugoira
     * @type {object}
     */
    this.meta = null;

    /**
     * @type {GeneralArtworkProvider}
     */
    this.provider;

    /**
     * @type {string}
     */
    this.type = 'Pixiv Ugoira';
  }

  /**
   * @override
   * @returns {string}
   */
  get title() {
    if (this.context) {
      return this.context.title
    } else if (this.title) {
      return this.title;
    } else {
      return this.id;
    }
  }

  /**
   *
   * @param {Object} options
   * @param {UgoiraProvider} options.provider
   */
  static createDownloader({ url, saveTo, options, provider }) {
    let downloader = new UgoiraDownloader();
    downloader.id = provider.id;
    downloader.url = url;
    downloader.saveTo = saveTo;
    downloader.options = options;
    downloader.provider = provider;

    return downloader;
  }

  /**
   * @returns {this}
   */
  makeSaveOption() {
    return this.makeSaveOptionFromRenameTemplate(SettingStorage.getSetting('ugoiraRename'));
  }

  /**
   * @override
   * @returns {String}
   */
  getImageSaveFolder() {
    return path.join(this.saveTo, this.getRelativeSaveFolder())
  }

  /**
   * Get ugoira meta url
   * @returns {string}
   */
  getMetaUrl() {
    return `https://www.pixiv.net/ajax/illust/${this.provider.context.id}/ugoira_meta`;
  }

  /**
   * @returns {Promise.<Object,Error>}
   */
  requestMeta() {
    return new Promise((resolve, reject) => {
      this.request = new Request({
        url: this.getMetaUrl(),
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
        } else {
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
            } else {
              reject(Error('_cannot_resolve_ugoira_meta'));
            }
          });

          response.on('aborted', () => {
            reject(Error('_abort'));
          });
        }
      });

      this.request.end();
    });
  }

  /**
   * Pack frames info into file
   * @param {string} file
   */
  packFramesInfo(file) {
    this.setProcessing('Packing frames infomation');

    debug.sendStatus(`Packing frames information to ${this.id}`);

    fs.readFile(file).then(data => {
      return Zip.loadAsync(data);
    }).then(zip => {
      zip.file('animation.json', JSON.stringify(this.meta.frames));

      zip.generateNodeStream({
        type: 'nodebuffer',
        streamFiles: true
      }).pipe(fs.createWriteStream(file))
        .on('finish', () => {
          debug.sendStatus(`${this.id} frames information packed`);

          /**
           * Check if convert ugoira to gif, if not then set downloader complete.
           */
          if (SettingStorage.getDefault().getSetting('convertUgoiraToGif')) {
            TaskManager.getDefault().addTaskPayload(UgoiraConvertTask.name, {
              file: file,
              saveFile: path.join(this.saveFolder, this.saveFilename) + '.gif'
            });
            this.setFinish('Download complete, GIF generation task has send to task');
          } else {
            this.setFinish('Download complete, GIF generate skipped');
          }
        });
    }).catch(error => {
      this.setError(error);
    });
  }

  /**
   * Download zip file
   */
  downloadZip() {
    const url = this.meta.originalSrc;

    this.makeSaveOption();

    let downloadOptions = Object.assign({},
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

      this.progress = this.download.progress;
      this.setDownloading();
      this.packFramesInfo(this.download.getSavedFile());
    });

    this.download.on('dl-progress', () => {
      this.progress = this.download.progress;
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

  /**
   * Start download
   */
  start() {
    this.setStart();

    if (!this.meta) {
      this.setDownloading('_fetch_ugoira_meta');

      this.requestMeta().then(meta => {
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

    this.setStop();

    /**
     * Enable firing events again
     */
    mute === true && this.setMute(false);
  }
}

export default UgoiraDownloader;
