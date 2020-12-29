import fs from 'fs-extra';
import ServiceContainer from '@/ServiceContainer';

/**
 * This class used for caching download ids for restoring downloads after
 * the application restarted. It dose NOT cache download progress, only caches
 * the download id. So after application restarted, you can read download ids
 * from it and re-create the download and append it to the DownloadManager.
 * Because the download task will skip the downloaded file so it looks like
 * the downloads been restored.
 *
 * Make sure use the method removeDownload to remove the finish downloads or
 * the finish downloads will be re-created and append to the DownloadManager
 * after application startup everytime.
 */
class DownloadCacheManager {

  /**
   * @type {DownloadCacheManager}
   */
  static instance = null;

  /**
   * @constructor
   * @param {Object} options
   * @param {string} options.cacheFile
   */
  constructor(options) {
    this.debugService = ServiceContainer.getService('debug');

    this.cacheFile = options.cacheFile;

    fs.createFileSync(this.cacheFile);

    try {
      this.cachedDownloads = JSON.parse(fs.readFileSync(this.cacheFile));
    } catch (error) {
      this.cachedDownloads = {};
      this.debugService.sendNotice('Cannot read cached downloads');
    }
  }

  /**
   * @constructor
   * @param {Object} options
   * @param {string} options.cacheFile
   * @returns {DownloadCacheManager}
   */
  static getManager(options) {
    if (!DownloadCacheManager.instance) {
      DownloadCacheManager.instance = new DownloadCacheManager(options);
    }

    return DownloadCacheManager.instance;
  }

  getCachedDownloads() {
    return this.cachedDownloads;
  }

  cacheDownload(download) {
    if (download.id && this.cachedDownloads[download.id] === undefined) {
      this.cachedDownloads[download.id] = {
        url: download.url,
        options: download.options
      };

      try {
        fs.writeFileSync(this.cacheFile, JSON.stringify(this.cachedDownloads));
      } catch (error) {
        this.debugService.sendNotice(`Cannot cache download to storage: ${error.message}`);
      }
    }
  }

  cacheDownloads(downloads) {
    downloads.forEach(download => {
      if (download.id && this.cachedDownloads[download.id] === undefined) {
        this.cachedDownloads[download.id] = {
          url: download.url,
          options: download.options
        };
      }
    });

    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(this.cachedDownloads));
    } catch (error) {
      this.debugService.sendNotice(`Cannot cache download to storage: ${error.message}`);
    }
  }

  removeDownload(downloadId) {
    delete this.cachedDownloads[downloadId];

    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(this.cachedDownloads));
    } catch (error) {
      this.debugService.sendNotice(`Cannot remove download from storage: ${error.message}`);
    }
  }

  /**
   * @param {Array} downloadIds
   */
  removeDownloads(downloadIds) {
    downloadIds.forEach(downloadId => {
      delete this.cachedDownloads[downloadId];
    });

    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(this.cachedDownloads));
    } catch (error) {
      this.debugService.sendNotice(`Cannot remove download from storage: ${error.message}`);
    }
  }

  /**
   * Move cache file to destination
   * @param {String} dest
   * @returns {void}
   */
  moveCacheFile(dest) {
    if (dest !== this.cacheFile && fs.existsSync(this.cacheFile)) {
      fs.moveSync(this.cacheFile, dest, {
        overwrite: true
      });

      this.cacheFile = dest;
    }
  }
}

export default DownloadCacheManager;
