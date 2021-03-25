import { parse } from 'node-html-parser';
import { debug } from '@/global';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import Request from '@/modules/Request';
import BookmarkProvider from '../../Providers/Pixiv/BookmarkProvider';
import DownloadAdapter from '../../DownloadAdapter';

class BookmarkDownloader extends WorkDownloader {
  constructor() {
    super();

    /**
     * @type {string}
     */
    this.type = 'Pixiv Bookmark Page';

    /**
     * @type {BookmarkProvider}
     */
    this.provider;

    /**
     * @type {string}
     */
    this.responseBody = '';
  }

  /**
   * Create a bookmark downloader
   * @param {{ url: string, saveTo: string, options: object, provider: BookmarkProvider}} args
   * @returns {BookmarkDownloader}
   */
  static createDownloader({ url, saveTo, options, provider }) {
    let downloader = new BookmarkDownloader();
    downloader.id = provider.id;
    downloader.url = url;
    downloader.saveTo = saveTo;
    downloader.options = options;
    downloader.provider = provider;

    return downloader;
  }

  /**
   *
   * @param {string} body
   */
  setResponseBody(body) {
    this.responseBody = body;
  }

  /**
   * Get bookmark url
   * @returns {string}
   */
  getBookmarkUrl() {
    return `https://www.pixiv.net/bookmark.php?rest=${this.options.rest}&type=illust_all` + (this.options.page > 1 ? `&p=${this.options.page}` : '');
  }

  getArtworkUrl(id) {
    return `https://www.pixiv.net/artworks/${id}`
  }

  /**
   *
   * @param {string} content
   * @return {any[]|null}
   */
  getItems(content) {
    let dom = parse(content);
    return dom.querySelectorAll('.display_editable_works .image-item');
  }

  /**
   * Create general artwork downloader via content
   * @param {string} content
   * @returns {void}
   */
  createGeneralArtworkDownloaders(content) {
    let provider,
        $items = this.getItems(content);

    if ($items && $items.length > 0) {
      $items.forEach($item => {
        let $work = $item.querySelector('a.work');

        if ($work) {
          let path = $work.getAttribute('href');

          if (path) {
            let matches = path.match(/(\d+)$/);

            if (matches) {
              /**
               * Get target downloader provider
               */
              provider = DownloadAdapter.getProvider(this.getArtworkUrl(matches[1]));

              /**
               * Add downloader to download manager
               */
              this.downloadManager.addDownloader(provider.createDownloader({
                url: this.getArtworkUrl(matches[1]),
                saveTo: this.saveTo,
                options: this.options
              }));
            }
          }
        }
      });
    }
  }

  /**
   * Check if the downloader is valid
   */
  canDownload() {
    let $items = this.getItems(this.responseBody);
    return $items && $items.length > 0;
  }

  /**
   * @returns {Promise.<void,Error>}
   */
  requestBookmarkContent() {
    this.setProcessing('_resolving_artworks');

    return new Promise((resolve, reject) => {
      this.request = new Request({
        url: this.getBookmarkUrl(),
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

  /**
   * Start downloader
   */
  start() {
    this.setStart();

    if (this.responseBody) {
      try {
        this.createGeneralArtworkDownloaders(this.responseBody);
        this.setFinish();
        this.downloadManager.deleteDownload({ downloadId: this.id });
      } catch(error) {
        this.setError(error);
      }
    } else {
      this.requestBookmarkContent().then(content => {
        return this.createGeneralArtworkDownloaders(content);
      }).then(() => {
        this.setFinish();
        this.downloadManager.deleteDownload({ downloadId: this.id });
      }).catch(error => {
        this.setError(error);
      });
    }
  }
}

export default BookmarkDownloader;
