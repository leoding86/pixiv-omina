import WorkDownloader from './WorkDownloader';

function DownloadManager() {
  this.workDownloadList = [];
  this.workDownloaderPool = {};
}

/**
 * @type {DownloadManager}
 */
DownloadManager.instance = null;

/**
 * @type {DownloadManager}
 */
DownloadManager.getManager = () => {
  if (!DownloadManager.instance) {
    DownloadManager.instance = new DownloadManager();
  }

  return DownloadManager.instance;
}

/**
 * @returns {WorkDownloader}
 */
DownloadManager.getWorkDownloader = (id) => {
  return DownloadManager.instance.getWorkDownloader();
}

DownloadManager.prototype = {
  /**
   * @param {string} id
   * @returns {WorkDownloader}
   */
  getWorkDownloader(id) {
    return this.workDownloaderPool[id] || null;
  }
}

export default DownloadManager;
