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

    /**
     * Configurate download
     */
    // Download.setGlobalOptions({
    //   headers: {
    //     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3964.0 Safari/537.36',
    //   }
    // });

    this.mainWindow = WindowManager.getWindow('app');

    this.downloadManager = DownloadManager.getManager();

    this.downloadManager.on('add', downloader => {
      // console.log(downloader.toJSON());

      this.mainWindow.webContents.send(this.responseChannel('add'), downloader.toJSON());
    });

    this.downloadManager.on('update', downloader => {//
      // console.log(downloader);

      this.mainWindow.webContents.send(this.responseChannel('update'), downloader.toJSON());
    });

    this.downloadManager.on('delete', workId => {
      // console.log(workId);

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

  createDownloadAction({workId, url, saveTo}) {
    debug.sendStatus('Try to create download');

    try {
      fs.ensureDirSync(saveTo);
    } catch (error) {
      WindowManager.getWindow('app').webContents.send(this.responseChannel('error'), `Cannot save files to path ${saveTo}`);

      debug.sendStatus('Cannot create save path');

      return;
    }

    if (!workId) {
      workId = UrlParser.getWorkIdFromUrl(url);
    }

    if (!workId) {
      WindowManager.getWindow('app').webContents.send(this.responseChannel('error'), `It's a invalid download url: ${url}`);

      debug.sendStatus('Cannot create download');

      return;
    }

    if (!this.downloadManager.getWorkDownloader(workId)) {
      this.downloadManager.createWorkDownloader({
        workId,
        options: {
          saveTo: saveTo
        }
      });

      debug.sendStatus('Download created');

      return;
    }

    debug.sendStatus('Duplicated download');

    WindowManager.getWindow('app').webContents.send(this.responseChannel('duplicated'), workId);
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
