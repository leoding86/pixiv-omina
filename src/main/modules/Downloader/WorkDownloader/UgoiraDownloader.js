import TaskManager from '@/modules/TaskManager';
import UgoiraConvertTask from '@/modules/Task/UgoiraConvertTask';
import Download from '@/modules/Download';
import FormatName from '@/modules/Utils/FormatName';
import SettingStorage from '@/modules/SettingStorage';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import WorkDownloaderUnstoppableError from '../WorkDownloaderUnstoppableError';
import Zip from 'jszip';
import { debug } from '@/global';
import fs from 'fs-extra';
import path from 'path';
import { PixivUgoiraProvider } from '../Providers';

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

    /**
     * @type {PixivUgoiraProvider}
     */
    this.provider;

    this.type = 2;
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
   * @param {PixivUgoiraProvider} options.provider
   */
  static createDownloader({ provider, options }) {
    let downloader = new UgoiraDownloader();
    downloader.provider = provider;
    downloader.url = provider.url;
    downloader.id = provider.id;
    downloader.options = options;
    downloader.context = downloader.provider.context;

    return downloader;
  }

  /**
   * @returns {String}
   */
  getImageSaveName() {
    return FormatName.format(SettingStorage.getSetting('ugoiraRename').split('/').pop(), this.context);
  }

  /**
   * @override
   * @returns {String}
   */
  getRelativeSaveFolder() {
    let parts = SettingStorage.getSetting('ugoiraRename').split('/');

    if (parts.length > 1) {
      parts.pop();
    }

    return path.join(FormatName.format(parts.join('/'), this.context, null, { mode: 'folder' }), '/');
  }

  /**
   * @override
   * @returns {String}
   */
  getImageSaveFolder() {
    return path.join(this.options.saveTo, this.getRelativeSaveFolder())
  }

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
              saveFile: path.join(this.download.saveTo, this.getImageSaveName()) + '.gif'
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

  downloadZip() {
    const url = this.meta.originalSrc;

    let downloadOptions = Object.assign({},
      this.options,
      {
        url: url,
        saveTo: this.getImageSaveFolder(),
        saveName: this.getImageSaveName()
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

  start() {
    this.setStart();

    if (!this.meta) {
      this.setDownloading('Fetch ugoira meta for downloading');

      this.provider.requestMeta().then(meta => {
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

    this.provider.request && this.provider.request.abort();
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
