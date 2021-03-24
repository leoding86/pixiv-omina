import BaseProviderV2 from './BaseProviderV2';
import BookmarkDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/BookmarkDownloader';

class BookmarkProvider extends BaseProviderV2 {
  /**
   * @enum {string}
   */
  static rest = {
    SHOW: 'show',
    HIDE: 'hide',
  };

  constructor({
    rest = BookmarkProvider.rest.SHOW,
    page = 1
  }) {
    super();

    /**
     * @type {string}
     */
    this.rest = rest;

    /**
     * @type {number}
     */
    this.page = page;

    /**
     * @type {string}
     */
    this.url = this.getBookmarkUrl(); // used for display as download title
  }

  /**
   * Get bookmark url
   * @returns {string}
   */
  getBookmarkUrl() {
    return `https://www.pixiv.net/bookmark.php?rest=${this.rest}&type=illust_all` + (this.page > 1 ? `&p=${this.page}` : '');
  }

  /**
   *
   * @param {object} options
   * @param {BookmarkProvider.rest} options.rest
   * @param {string} options.page
   * @returns {BookmarkProvider}
   */
  static createProvider({ rest, page }) {
    return new BookmarkProvider({ rest, page });
  }

  /**
   * @returns {string}
   */
  get id() {
    return [this.providerName, 'bookmark', this.rest, this.page].join(':');
  }

  /**
   * Create a bookmark downloader
   * @param {{ saveTo: string }} args
   * @returns {BookmarkDownloader}
   */
  createDownloader({ saveTo }) {
    return BookmarkDownloader.createDownloader({
      url: this.getBookmarkUrl(),
      saveTo,
      options: {
        rest: this.rest,
        page: this.page
      },
      provider: this
    });
  }
}

export default BookmarkProvider;
