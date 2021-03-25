import {
  ipcMain
} from 'electron';
import {
  debug
} from '@/global';

import BaseService from '@/services/BaseService';
import DownloadAdapter from '@/modules/Downloader/DownloadAdapter';
import DownloadCacheManager from '@/modules/DownloadCacheManager';
import DownloadManager from '@/modules/Downloader/DownloadManager';
import NotificationManager from '@/modules/NotificationManager';
import SettingStorage from '@/modules/SettingStorage';
import { PixivBookmarkProvider } from '@/modules/Downloader/Providers';
import WindowManager from '@/modules/WindowManager';
import path from 'path';
import GetPath from '@/modules/Utils/GetPath';
import BookmarkDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/BookmarkDownloader';

/**
 * @property {Number} updateSensitivity
 * @property {Boolean} downloadsRestored
 */
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

    this.updateSensitivity = 500;

    this.downloadsRestored = false;

    this.mainWindow = WindowManager.getWindow('app');

    this.downloadManager = DownloadManager.getManager();

    this.settingStorage = SettingStorage.getDefault();

    this.notificationManager = NotificationManager.getDefault();

    /**
     * @type {DownloadCacheManager}
     */
    this.downloadCacheManager = DownloadCacheManager.getManager({
      cacheFile: SettingStorage.getSetting('singleUserMode') === false ?
        path.join(GetPath.userData(), 'cached_downloads.json') :
        path.join(GetPath.installation(), 'cached_downloads.json')
    });

    /**
     * Listen settings change. If setting singleUserMode has been changed, the download cached file should
     * be moved to new location.
     */
    this.settingStorage.on('change', (newSettings, oldSettings) => {
      if (newSettings.singleUserMode && !oldSettings.singleUserMode) {
        this.downloadCacheManager.moveCacheFile(path.join(GetPath.installation(), 'cached_downloads.json'));
      } else if (!newSettings.singleUserMode && oldSettings.singleUserMode) {
        this.downloadCacheManager.moveCacheFile(path.join(GetPath.userData(), 'cached_downloads.json'));
      }
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
        let nowTime = Date.now();
        if (this.startTime === null || (nowTime - this.startTime) >= this.updateSensitivity) {
          this.startTime = nowTime;
          this.mainWindow.webContents.send(this.responseChannel('update'), downloader.toJSON());
        }
      }
    });

    this.downloadManager.on('finish', downloader => {
      this.mainWindow.webContents.send(this.responseChannel('update'), downloader.toJSON());
      this.downloadCacheManager.removeDownload(downloader.id);
    });

    this.downloadManager.on('delete', id => {
      this.downloadCacheManager.removeDownload(id);

      this.mainWindow.webContents.send(this.responseChannel('delete'), id);
    });

    ipcMain.on(DownloadService.channel, this.channelIncomeHandler.bind(this));

    this.startTime = null;

    // this.restoreDownloads();

    // this.mainWindow.webContents.send(this.responseChannel('restore'));
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

  /**
   * test method
   */
  restoreDownloadsAction({ saveTo }) {
    this.restoreDownloads({ saveTo });
  }

  restoreDownloads({ saveTo }) {
    /**
     * Check if the downloads has been restored
     */
    if (this.downloadsRestored) {
      return;
    }

    /**
     * Mark downloads has been restored
     */
    this.downloadsRestored = true;

    const cachedDownloads = this.downloadCacheManager.getCachedDownloads();

    let downloaders = [], count = 0;

    debug.sendStatus('Restoring downloads');

    Object.keys(cachedDownloads).forEach(key => {
      try {
        let options = cachedDownloads[key].options;

        if (saveTo) {
          options.saveTo = saveTo;
        }

        let provider = DownloadAdapter.getProvider(cachedDownloads[key].url);

        downloaders.push(provider.createDownloader({
          url: cachedDownloads[key].url,
          saveTo: options.saveTo || cachedDownloads[key].saveTo || this.settingStorage.getSetting('saveTo'), // for compatibility
          options
        }));

        count++;
      } catch (error) {
        debug.log(error);
        this.downloadCacheManager.removeDownload();
      }
    });

    /**
     * do not start downloads automatically after downloads are restored
     */
    this.downloadManager.addDownloaders(downloaders, {
      mute: false
    });

    this.mainWindow.webContents.send(this.responseChannel('download-service:restore'));

    debug.sendStatus('Downloads have been restored. Count: ' + count);
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
//
  /**
   * Handle create download action sent from renderer
   * @param {{url: String, saveTo: String, types: Object}} args
   */
  createDownloadAction({url, saveTo, types}) {
    try {
      let provider = DownloadAdapter.getProvider(url);
      let options = {};

      /**
       * Build acceptTypes option
       */
      if (types) {
        options.acceptTypes = types;
      }

      /**
       * Testing new way to add downloaders
       */
      this.downloadManager.addDownloader(provider.createDownloader({ saveTo, options }));
    } catch (error) {
      debug.log(error);
      WindowManager.getWindow('app').webContents.send(this.responseChannel('error'), error.message);
    }
  }

  /**
   * Handle create bookmark download action sent from renderer
   * @param {Object} options
   * @param {Array} options.pages
   * @param {String} options.rest
   * @param {String} options.saveTo
   */
  createBmDownloadAction({pages, rest, saveTo}) {
    try {
      let options = { pages, rest },
          provider = PixivBookmarkProvider.createProvider(options);

      this.downloadManager.addDownloader(provider.createDownloader({
        saveTo,
        options
      }));
    } catch (error) {
      debug.log(error);
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

  /**
   * @returns {void}
   */
  hasCachedDownloadsAction() {
    if (this.downloadsRestored) {
      return;
    }

    WindowManager.getWindow('app').webContents.send(
      this.responseChannel('cached-downloads-result'),
      Object.keys(this.downloadCacheManager.getCachedDownloads()).length > 0
    )
  }

  clearCachedDownloadsAction() {
    this.downloadCacheManager.clearDownloads();
  }
}

export default DownloadService;
