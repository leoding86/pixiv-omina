import {
  ipcMain
} from 'electron';
import Download from '@/modules/Download';
import DownloadManager from '@/modules/Downloader/DownloadManager';
import BaseService from '@/services/BaseService';

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
    Download.setGlobalOptions({
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3964.0 Safari/537.36',
      }
    });

    this.downloadManager = DownloadManager.getManager();

    this.downloadManager.on('start', ({ workDownloader }) => {
      //
    });

    this.downloadManager.on('stop', ({ workDownloader }) => {
      //
    });

    this.downloadManager.on('update', ({ workDownloader }) => {
      //
    });

    this.downloadManager.on('progress', ({ workDownloader }) => {
      //
    });

    this.downloadManager.on('finish', ({ workDownloader }) => {
      //
    });

    this.downloadManager.on('delete', ({ workId }) => {
      //
    });

    this.downloadManager.on('error', ({ workDownloader }) => {
      //
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

  createDownloadAction({workId}) {
    if (this.downloadManager.getWorkDownloader(workId)) {
      //
      return;
    }

    this.downloadManager.createWorkDownloader({workId});
  }

  deleteDownloadAction({downloadId}) {
    this.downloadManager.deleteWorkDownloader({downloadId});
  }

  stopDownloadAction({downloadId}) {
    this.downloadManager.stopWorkDownloader({downloadId});
  }

  startDownloadAction({downloadId}) {
    this.downloadManager.startWorkDownloader({downloadId});
  }
}

export default DownloadService;
