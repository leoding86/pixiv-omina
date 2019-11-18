import {
  ipcMain
} from 'electron';
import Download from '@/modules/Download';
import DownloadManager from '@/modules/Downloader/DownloadManager';

class DownloadService {
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
    /**
     * Configurate download
     */
    Download.setGlobalHeaders({
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3964.0 Safari/537.36',
    });

    this.downloadManager = DownloadManager.getManager();

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

  channelIncomeHandler(event, args) {
    this.callAction(args.action, args.args);
  }

  callAction(action, args) {
    let method;

    if (typeof action === 'string' && action.length > 0) {
      method = `${action}Action`;
    }

    if (typeof this[method] === 'function') {
      this[method].call(this, args);
      return;
    }

    Error(`Invalid action method '${method}'`);
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
