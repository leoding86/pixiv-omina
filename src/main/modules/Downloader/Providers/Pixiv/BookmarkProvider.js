import BaseProvider from '@/modules/Downloader/Providers/Pixiv/BaseProvider';
import BookmarkDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/BookmarkDownloader';

class BookmarkProvider extends BaseProvider {
  constructor({ url, context }) {
    super({ url, context });
  }

  get id() {
    return [this.providerName, 'bookmark'].join(':');
  }

  /**
   * Get bookmark url
   * @returns {string}
   */
  static getBookmarkUrl({ rest = 'show', page = 1}) {
    return `https://www.pixiv.net/bookmark.php?rest=${rest}&type=illust_all` + (page > 1 ? `&p=${page}` : '');
  }

  /**
   *
   * @returns {BookmarkProvider}
   */
  static createProvider({ rest = 'show', pages = 1}) {
    let provider = new BookmarkProvider({
      url: BookmarkProvider.getBookmarkUrl({ rest }),
      context: { rest, pages }
    });

    return provider;
  }

  /**
   *
   * @param {{ saveTo: string, options: object }} args
   * @returns {BookmarkDownloader}
   */
  createDownloader({ saveTo, options }) {
    return BookmarkDownloader.createDownloader({
      url: this.url,
      saveTo,
      options,
      provider: this
    });
  }
}

export default BookmarkProvider;
