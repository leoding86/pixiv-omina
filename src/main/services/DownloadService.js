import {
  app,
  ipcMain
} from 'electron';

import BaseService from '@/services/BaseService';
import DownloadCacheManager from '@/modules/DownloadCacheManager';
import DownloadAdapter from '@/modules/Downloader/DownloadAdapter';
import DownloadManager from '@/modules/Downloader/DownloadManager';
import NotificationManager from '@/modules/NotificationManager';
import UndeterminedDownloader from '@/modules/Downloader/WorkDownloader/UndeterminedDownloader';
import UrlParser from '@/modules/UrlParser';
import WindowManager from '@/modules/WindowManager';
import {
  debug
} from '@/global';
import fs from 'fs-extra';
import path from 'path';

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

    /**
     * @type {DownloadCacheManager}
     */
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

    this.downloadManager.on('delete-batch', downloadIds => {
      this.downloadCacheManager.removeDownloads(downloadIds);//

      this.mainWindow.webContents.send(this.responseChannel('delete-batch'), downloadIds);
    });

    this.downloadManager.on('stop', download => {
      this.mainWindow.webContents.send(this.responseChannel('stop'), download.toJSON());
    });

    this.downloadManager.on('stop-batch', downloadIds => {
      this.mainWindow.webContents.send(this.responseChannel('stop-batch'), downloadIds);
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

    Object.keys(cachedDownloads).forEach(key => {
      try {
        downloaders.push(UndeterminedDownloader.createDownloader({
          provider: DownloadAdapter.getProvider(cachedDownloads[key].url),
          options: cachedDownloads[downloadId].options
        }));
      } catch (error) {
        this.downloadCacheManager.removeDownload();
      }
    });

    debug.sendStatus('Downloads have been restored');

    /**
     * do not start downloads automatically after downloads are restored
     */
    this.downloadManager.addDownloaders(downloaders, {
      mute: true,
      autoStart: false
    });
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
    try {
      let provider = DownloadAdapter.getProvider(url);

      this.downloadManager.createDownloader({
        provider,
        options: {
          saveTo: saveTo
        }
      });
    } catch (error) {
      WindowManager.getWindow('app').webContents.send(this.responseChannel('error'), error.message);
    }
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

    if (!downloadId) {
      this.downloadManager.downloadNext();
    } else {
      this.downloadManager.startWorkDownloader({downloadId});
    }
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

    this.downloadManager.stopDownloads({downloadIds});
  }

  batchDeleteDownloadsAction({downloadIds}) {
    debug.sendStatus('Batch delete downloads');

    this.downloadManager.deleteDownloads({downloadIds});
  }

  openFolderAction({downloadId}) {
    debug.sendStatus('Open download folder')

    this.downloadManager.openFolder({downloadId});
  }
}

export default DownloadService;
