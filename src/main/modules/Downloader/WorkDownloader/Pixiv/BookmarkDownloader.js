import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import BookmarkProvider from '@/modules/Downloader/Providers/Pixiv/BookmarkProvider';
import BookmarkPageProvider from '@/modules/Downloader/Providers/Pixiv/BookmarkPageProvider';
import Request from '@/modules/Request';

class BookmarkDownloader extends WorkDownloader {
  constructor() {
    super();

    /**
     * @type {BookmarkProvider}
     */
    this.provider;

    /**
     * @type {string}
     */
    this.type = 'Pixiv Bookmark';

    /**
     * @type {string}
     */
    this.rest = 'show';

    /**
     * @type {number[]|null}
     */
    this.pages = [];

    /**
     * @type {number}
     */
    this.pageIndex = 0;

    /**
     * @type {number}
     */
    this.currentPage = 1;
  }

  /**
   *
   * @param {{ url: string, saveTo: string, options: {rest: string, page: number}, provider: BookmarkProvider}} args
   * @returns {BookmarkDownloader}
   */
  static createDownloader({ url, saveTo, options, provider }) {
    let downloader = new BookmarkDownloader();

    downloader.id = provider.id;
    downloader.url = url;
    downloader.saveTo = saveTo;
    downloader.options = options;
    downloader.provider = provider;
    downloader.pages = options.pages;
    downloader.rest = options.rest;

    return downloader;
  }

  /**
   * Get content of the bookmark
   */
  requestBookmarkPageBody(url) {
    this.setDownloading('_resolve_bookmark_page_content');

    return new Promise((resolve, reject) => {
      this.request = new Request({
        url,
        method: 'GET'
      });

      this.request.on('response', response => {
        let body = '';

        response.on('data', data => {
          body += data;
        });

        response.on('end', () => {
          resolve(body);
        });

        response.on('error', error => {
          reject(error);
        });

        response.on('aborted', () => {
          reject(Error('Response has been interrepted'));
        });
      });

      this.request.on('error', error => {
        reject(error);
      });

      this.request.on('abort', () => {
        reject(Error('Request has been interrepted'));
      });

      this.request.on('end', () => this.request = null);

      this.request.end();
    });
  }

  addBookmarkPageDownloader() {
    let page = this.getNextPage();

    if (page) {
      return new Promise((resolve, reject) => {
        let url = BookmarkProvider.getBookmarkUrl({
          rest: this.rest,
          page
        });

        this.requestBookmarkPageBody(url).then(responseBody => {
          let downloader = BookmarkPageProvider.createProvider({
            rest: this.rest,
            page
          }).createDownloader({
            saveTo: this.saveTo,
            options: this.options
          });

          downloader.setResponseBody(responseBody);

          if (downloader.canDownload()) {
            this.downloadManager.addDownloader(downloader);
            resolve(this.addBookmarkPageDownloader());
          } else {
            resolve();
          }
        }).catch(error => {
          this.setError(error);
        });
      });
    } else {
      return;
    }
  }

  getNextPage() {
    let page;

    if (this.pages && this.pages.length > 0) {
      page = this.pages[this.pageIndex];
      this.pageIndex++;

      if (!page) {
        return null
      }
    } else {
      page = this.currentPage;
      this.currentPage++;
    }

    return page;
  }

  /**
   * Start download
   */
  start() {
    this.setStart();

    this.addBookmarkPageDownloader().then(() => {
      this.setFinish();
      this.downloadManager.deleteDownload({ downloadId: this.id });
    }).catch(error => {
      this.setError(error);
    });
  }
}

export default BookmarkDownloader;
