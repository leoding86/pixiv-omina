import path from 'path';
import fs from 'fs-extra';
import {
  app,
  ipcMain
} from 'electron';
import {
  debug
} from '@/global';
import UrlParser from '@/modules/UrlParser';
import WindowManager from '@/modules/WindowManager';
import DownloadManager from '@/modules/Downloader/DownloadManager';
import DownloadCacheManager from '@/modules/DownloadCacheManager';
import NotificationManager from '@/modules/NotificationManager';
import BaseService from '@/services/BaseService';
import UndeterminedDownloader from '@/modules/Downloader/WorkDownloader/UndeterminedDownloader';

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

    this.notificationManager = NotificationManager.getDefault();

    this.downloadCacheManager = DownloadCacheManager.getManager({
      cacheFile: path.join(app.getPath('userData'), 'cached_downloads.json')
    });

    this.downloadManager.on('add', downloader => {
      this.downloadCacheManager.cacheDownload(downloader);

      this.notificationManager.showDownloadAddedNotification({
        title: `Download ${downloader.id} is added`
      });

      this.mainWindow.webContents.send(this.responseChannel('add'), downloader.toJSON());
    });

    this.downloadManager.on('add-batch', downloaders => {
      let data = [];

      downloaders.forEach(downloader => {
        data.push(downloader.toJSON());
      });

      this.downloadCacheManager.cacheDownloads(downloaders);

      this.mainWindow.webContents.send(this.responseChannel('add-batch'), data);
    });

    this.downloadManager.on('update', downloader => {
      if (this.downloadManager.getWorkDownloader(downloader.id)) {
        this.mainWindow.webContents.send(this.responseChannel('update'), downloader.toJSON());
      }
    });

    this.downloadManager.on('finish', downloader => {
      this.downloadCacheManager.removeDownload(downloader.id);
    });

    this.downloadManager.on('delete', id => {
      this.downloadCacheManager.removeDownload(id);

      this.mainWindow.webContents.send(this.responseChannel('delete'), id);
    });

    ipcMain.on(DownloadService.channel, this.channelIncomeHandler.bind(this));

    this.restoreDownloads();
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

  restoreDownloads() {
    const cachedDownloads = this.downloadCacheManager.getCachedDownloads();
    let downloaders = [];

    debug.sendStatus('Restoring downloads');

    for (let downloadId in cachedDownloads) {
      console.log(cachedDownloads[downloadId], downloadId);
      downloaders.push(UndeterminedDownloader.createDownloader({
        workId: downloadId,
        options: cachedDownloads[downloadId].options
      }));
    }

    debug.sendStatus('Downloads have been restored');

    const mute = true;

    this.downloadManager.addDownloaders(downloaders, mute);
  }

  fetchAllDownloadsAction() {
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

  batchStartDownloadsAction({downloadIds}) {
    debug.sendStatus('Batch start downloads');

    downloadIds.forEach(downloadId => {
      this.downloadManager.startWorkDownloader({downloadId})
    });
  }

  batchStopDownloadsAction({downloadIds}) {
    debug.sendStatus('Batch stop downloads');

    downloadIds.forEach(downloadId => {
      this.downloadManager.stopWorkDownloader({downloadId});
    });
  }

  batchDeleteDownloadsAction({downloadIds}) {
    debug.sendStatus('Batch delete downloads');

    downloadIds.forEach(downloadId => {
      this.downloadManager.deleteWorkDownloader({downloadId});
    });
  }

  openFolderAction({downloadId}) {
    debug.sendStatus('Open download folder')

    this.downloadManager.openFolder({downloadId});
  }
}

export default DownloadService;
