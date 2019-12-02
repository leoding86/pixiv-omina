import fs from 'fs-extra';
import {
  ipcMain
} from 'electron';
import {
  debug
} from '@/global';
import UrlParser from '@/modules/UrlParser';
import WindowManager from '@/modules/WindowManager';
import DownloadManager from '@/modules/Downloader/DownloadManager';
import BaseService from '@/services/BaseService';
import ServiceContainer from '@/ServiceContainer';

class DownloadService extends BaseService {
  /**
   * @property
   * @type {DownloadManager}
   */
  static instance;

  /**
   * @property
   * @type {string}
   */
  static channel = 'download-service';

  constructor() {
    super();

    this.mainWindow = WindowManager.getWindow('app');

    this.downloadManager = DownloadManager.getManager();

    this.downloadManager.on('add', downloader => {
      this.mainWindow.webContents.send(this.responseChannel('add'), downloader.toJSON());
    });

    this.downloadManager.on('add-batch', downloaders => {
      let data = [];

      downloaders.forEach(downloader => {
        data.push(downloader.toJSON());
      });

      this.mainWindow.webContents.send(this.responseChannel('add-batch'), data);
    });

    this.downloadManager.on('update', downloader => {
      if (this.downloadManager.getWorkDownloader(downloader.id)) {
        this.mainWindow.webContents.send(this.responseChannel('update'), downloader.toJSON());
      }
    });

    this.downloadManager.on('delete', workId => {
      this.mainWindow.webContents.send(this.responseChannel('delete'), workId);
    });

    ipcMain.on(DownloadService.channel, this.channelIncomeHandler.bind(this));
  }

  /**
   * @returns {DownloadService}
   */
  static getService() {
    if (!DownloadService.instance) {
      DownloadService.instance = new DownloadService();
    }

    return DownloadService.instance;
  }

  /**
   * Get renderer response channel
   * @param {string} name
   */
  responseChannel(name) {
    return DownloadService.channel + `:${name}`;
  }

  fetchAllDownloadsAction()
  {
    debug.sendStatus('Fetching all downloads');

    let downloads = [];

    this.downloadManager.getAllDownloader().forEach(download => {
      downloads.push(download.toJSON());
    });

    WindowManager.getWindow('app').webContents.send(this.responseChannel('downloads'), downloads);

    debug.sendStatus('All downloads are fetched');
  }

  createDownloadAction({url, saveTo}) {
    debug.sendStatus('Try to create download');

    try {
      fs.ensureDirSync(saveTo);
    } catch (error) {
      WindowManager.getWindow('app').webContents.send(this.responseChannel('error'), `Cannot save files to path ${saveTo}`);

      debug.sendStatus('Cannot create save path');

      return;
    }

    let workId = UrlParser.getWorkIdFromUrl(url);

    /**
     * This is a work url
     */
    if (workId) {
      if (this.downloadManager.getWorkDownloader(workId)) {
        debug.sendStatus('Duplicated download');

        WindowManager.getWindow('app').webContents.send(this.responseChannel('duplicated'), workId);

        return;
      }

      this.downloadManager.createWorkDownloader({
        workId,
        options: {
          saveTo: saveTo
        }
      });

      debug.sendStatus('Download created');

      return;
    }

    let userUrlInfo = UrlParser.getPixivUserUrlInfo(url);

    if (userUrlInfo) {
      workId = `user-${userUrlInfo.userId}`;

      if (this.downloadManager.getWorkDownloader(workId)) {
        debug.sendStatus('Duplicated download');

        WindowManager.getWindow('app').webContents.send(this.responseChannel('duplicated'), workId);

        return;//
      }

      this.downloadManager.createUserDownloader({
        workId,
        options: {
          saveTo: saveTo
        }
      });

      debug.sendStatus('User download created');

      return;
    }

    WindowManager.getWindow('app').webContents.send(this.responseChannel('error'), `It's a invalid download url: ${url}`);

    debug.sendStatus('Cannot create download');
  }

  deleteDownloadAction({downloadId}) {
    debug.sendStatus('Delete download');

    this.downloadManager.deleteWorkDownloader({downloadId});
  }

  stopDownloadAction({downloadId}) {
    debug.sendStatus('Stop download');

    this.downloadManager.stopWorkDownloader({downloadId});
  }

  startDownloadAction({downloadId}) {
    debug.sendStatus('Start download');

    this.downloadManager.startWorkDownloader({downloadId});
  }

  redownloadAction({downloadId}) {
    debug.sendStatus('Re-download')

    this.downloadManager.startWorkDownloader({downloadId, reset: true});
  }

  openFolderAction({downloadId}) {
    debug.sendStatus('Open download folder')

    this.downloadManager.openFolder({downloadId});
  }
}

export default DownloadService;
