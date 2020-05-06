import Request from '@/modules/Request';
import SettingStorage from '@/modules/SettingStorage';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import IllustrationDownloader from '@/modules/Downloader/WorkDownloader/IllustrationDownloader';
import MangaDownloader from '@/modules/Downloader/WorkDownloader/MangaDownloader';
import UgoiraDownloader from '@/modules/Downloader/WorkDownloader/UgoiraDownloader';
import UrlBuilder from '@/../utils/UrlBuilder';
import DateFormatter from '@/../utils/DateFormatter';

/**
 * It's a special downloader is used for get real downloader like illustration/manga/ugoira downloader
 * @class
 */
class UndeterminedDownloader extends WorkDownloader {

  /**
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * @param {Object} param
   * @param {number|string} param.workId
   * @param {Object} param.options
   * @returns {WorkDownloader}
   */
  static createDownloader({workId, options}) {
    let downloader = new UndeterminedDownloader();

    downloader.id = workId;
    downloader.options = Object.assign({}, options);

    return downloader;
  }

  getUserWorkDownloaders() {
    this.setStart('Resovling user works');

    return new Promise((resolve, reject) => {
      let userId = this.id.replace('user-', '');

      let userProfileAll = UrlBuilder.getUserProfileAllUrl(userId);

      this.request = new Request({
        url: userProfileAll,
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
            let error = Error('cannot resolve user profile');

            this.setError(error);

            reject(error);
            return;
          }

          let downloaders = [];//

          /**
           * It's important to REMOVE isUser property from options, or the cached system will cache the download as
           * a user works download and causes wired errors
           */
          delete this.options.isUser;

          Object.keys(jsonData.body.illusts).forEach(id => {
            downloaders.push(UndeterminedDownloader.createDownloader({
              workId: id,
              options: this.options
            }));
          });

          Object.keys(jsonData.body.manga).forEach(id => {
            downloaders.push(UndeterminedDownloader.createDownloader({
              workId: id,
              options: this.options
            }));
          });

          resolve(downloaders);

          return;
        });

        response.on('error', error => {
          this.setError(error);

          reject(error);
        });

        response.on('aborted', () => {
          let error = Error('Request has been interrepted');

          this.setError(error);

          reject(error);
        });
      });

      this.request.on('error', error => {
        this.setError(error);

        reject(error);
      });

      this.request.on('abort', () => {
        let error = Error('Request has been interrepted');

        this.setError(error);

        reject(error);
      });

      this.request.on('end', () => {
        this.request = null;
      });

      this.request.end();
    });
  }

  /**
   * @returns {Promise<WorkDownloader>}
   */
  getRealDownloader() {
    this.setStart('Resovling downloader');

    return new Promise((resolve, reject) => {
      let url = UrlBuilder.getWorkInfoUrl(this.id);

      this.request = new Request({
        url: url,
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
            let error = Error('cannot resolve work info');

            this.setError(error);

            reject(error);
            return;
          }

          /**
           * Set work info as context to downloader
           */
          let dateFormatter = DateFormatter.getDefault(jsonData.body.createDate);

          let context = Object.assign(jsonData.body, {
            year: dateFormatter.getYear(),
            month: dateFormatter.getMonth(),
            day: dateFormatter.getDay()
          });

          this.setContext(context);

          if (jsonData.body.illustType === 0) {
            let illustrationDownloader = IllustrationDownloader.createFromWorkDownloader(this);

            SettingStorage.getSetting('saveIllustrationInSubfolder') ?
              illustrationDownloader.enableSaveInSubfolder() : illustrationDownloader.disableSaveInSubfolder();

            resolve(illustrationDownloader);
          } else if (jsonData.body.illustType === 1) {
            resolve(MangaDownloader.createFromWorkDownloader(this));
          } else if (jsonData.body.illustType === 2) {
            let ugoiraDownloader = UgoiraDownloader.createFromWorkDownloader(this);

            SettingStorage.getSetting('saveUgoiraInSubfolder') ?
              ugoiraDownloader.enableSaveInSubfolder() : ugoiraDownloader.disableSaveInSubfolder();

            resolve(ugoiraDownloader);
          } else {
            let error = Error(`unsupported work type '${jsonData.body.illustType}'`);

            this.setError(error);

            reject(error.message);
          }
        });

        response.on('error', error => {
          this.setError(error);

          reject(error);
        })
      });

      this.request.on('abort', () => {
        this.setStop();

        reject();
      });

      this.request.on('error', error => {
        this.setError(error);

        reject(error);
      });

      this.request.on('close', () => {
        this.request = null;
      });

      this.request.end();
    });
  }

  reset() {
    // ignore but must have it
  }
}

export default UndeterminedDownloader;
