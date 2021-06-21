import BaseProvider from '@/modules/Downloader/Providers/Pixiv/BaseProvider';
import BookmarkDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/BookmarkDownloader';
import BookmarkPageDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/BookmarkPageDownloader';

/**
 * @class
 */
class BookmarkPageProvider extends BaseProvider {
  /**
   *
   * @param {{ url: string, context: {rest: string, page: number} }} args
   */
  constructor({ url, context }) {
    super({ url, context });
  }

  /**
   * Get bookmark url
   * @returns {string}
   */
  static getBookmarkUrl({ rest, page }) {
    return `https://www.pixiv.net/bookmark.php?rest=${rest}&type=illust_all` + (page > 1 ? `&p=${page}` : '');
  }

  /**
   *
   * @param {{ rest: string, page: number }} args
   * @returns {BookmarkPageProvider}
   */
  static createProvider({ rest, page }) {
    return new BookmarkPageProvider({
      url: BookmarkPageProvider.getBookmarkUrl({ rest, page }),
      context: {
        rest,
        page
      }
    });
  }

  /**
   * @returns {string}
   */
  get id() {
    return [this.providerName, 'bookmark', this.context.rest, this.context.page].join(':');
  }

  /**
   * Create a bookmark downloader
   * @param {{ saveTo: string }} args
   * @returns {BookmarkPageDownloader}
   */
  createDownloader({ saveTo }) {
    return BookmarkPageDownloader.createDownloader({
      url: this.url,
      saveTo,
      options: {
        rest: this.context.rest,
        page: this.context.page
      },
      provider: this
    });
  }
}

export default BookmarkPageProvider;
