import IllustrationDownloader from '@/modules/Downloader/WorkDownloader/IllustrationDownloader';
import MangaDownloader from '@/modules/Downloader/WorkDownloader/MangaDownloader';
import UrlBuilder from '@/../utils/UrlBuilder';
import WorkDownload from '@/modules/Downloader/WorkDownloader';
import { net } from 'electron';

class DownloaderFactory {
  /**
   * @param {WorkDownload} workDownloader
   */
  static makeDownloader(workDownloader) {
    return new Promise((resolve, reject) => {
      let workInfoUrl = UrlBuilder.getWorkInfoUrl(workDownloader.id);

      let request = net.request({
        method: 'GET',
        url: workInfoUrl
      });

      request.on('response', response => {
        let body = '';

        response.on('data', data => {
          body += data;
        });

        response.on('end', () => {
          let jsonData = JSON.parse(body.toString());

          if (!jsonData || jsonData.error || !jsonData.body) {
            reject(Error('cannot resolve work info'));
            return;
          }

          if (jsonData.body.illustType === 0) {
            resolve(IllustrationDownloader.createFromWorkDownloader(workDownloader));
          } else if (jsonData.body.illustType === 1) {
            resolve(MangaDownloader.createFromWorkDownloader(workDownloader));
          } else {
            reject(Error(`unsupported work type '${jsonData.body.illustType}'`))
          }
        });

        response.on('error',  error => {
          reject(error);
        })
      });

      request.on('error', error => {
        reject(error);
      });

      request.end();
    });
  }
}

export default DownloaderFactory;
