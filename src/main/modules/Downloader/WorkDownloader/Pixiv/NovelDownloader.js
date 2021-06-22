import NovelProvider from '@/modules/Downloader/Providers/Pixiv/NovelProvider';
import Request from '@/modules/Request';
import SettingStorage from '@/modules/SettingStorage';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import { debug } from '@/global';
import fs from 'fs-extra';
import path from 'path';

/**
 * @class
 */
class NovelDownloader extends WorkDownloader {

  /**
   * @constructor
   */
  constructor() {
    super();

    /**
     * @type {Request}
     */
    this.request;

    /**
     * @type {NovelProvider}
     */
    this.provider;

    /**
     * @type {any}
     */
    this.context = {};

    /**
     * @type {string}
     */
    this.type = 'Pixiv Novel';

    this.type = 'rgb(225, 225, 225)';
  }

  get title() {
    return this.context.title;
  }

  /**
   * Create downloader
   * @param {{ url: string, saveTo: string, options: any, provider: NovelProvider }} args
   * @returns {NovelDownloader}
   */
  static createDownloader({ url, saveTo, options, provider }) {
    let downloader = new NovelDownloader();
    downloader.id = provider.id;
    downloader.url = url;
    downloader.saveTo = saveTo;
    downloader.options = options;
    downloader.provider = provider;

    return downloader;
  }

  /**
   * Get user profile all url
   * @returns {string}
   */
  getNovelUrl() {
    return `https://www.pixiv.net/ajax/novel/${this.provider.context.id}`;
  }

  /**
   * @returns {Promise.<string[],Error>}
   */
  requestNovel() {
    return new Promise((resolve, reject) => {
      this.request = new Request({
        url: this.getNovelUrl(),
        method: 'GET'
      });

      this.request.on('response', response => {
        let body = '';

        response.on('data', data => {
          body += data;
        });

        response.on('end', () => {
          let jsonData = JSON.parse(body.toString());

          if (!jsonData || jsonData.error || !jsonData.body) {
            reject(Error('cannot resolve novel data'));
          } else {
            this.context = jsonData.body;
            resolve(jsonData.body);
          }
        });

        response.on('error', error => {
          reject(error);
        });

        response.on('aborted', () => {
          reject(Error('Response has been interrepted'));
        });
      });

      this.request.on('error', error => {
        reject(error);
      });

      this.request.on('abort', () => {
        reject(Error('Request has been interrepted'));
      });

      this.request.on('end', () => this.request = null);

      this.request.end();
    });
  }

  /**
   * Start downloader
   */
  start() {
    this.setStart();

    this.requestNovel().then(() => {
      this.makeSaveOptionFromRenameTemplate(SettingStorage.getSetting('novelRename'));

      this.savedTarget = path.join(this.saveFolder, this.saveFilename) + '.txt';

      fs.ensureFileSync(this.savedTarget);
      fs.writeFileSync(this.savedTarget, this.context.content);

      this.setFinish();
    }).catch(error => {
      debug.log(error);
      this.setError(error);
    });
  }

  /**
   * Stop downloader
   */
  stop() {
    this.setStop();
  }
}

export default NovelDownloader;
