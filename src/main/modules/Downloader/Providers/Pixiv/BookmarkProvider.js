import BaseProviderV2 from './BaseProviderV2';
import Request from '@/modules/Request';
import { parse } from 'node-html-parser';

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

    this.rest = rest;
    this.page = page;
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
   * Get bookmark url
   * @returns {string}
   */
  getBookmarkUrl() {
    return `https://www.pixiv.net/bookmark.php?rest=${this.type}&type=illust_all` + (this.page > 2 ? `&p=${this.page}` : '');
  }

  getArtworkUrl(id) {
    return `https://www.pixiv.net/artworks/${id}`
  }

  /**
   * Parse the work from content
   * @param {string} content
   * @returns {string[]}
   */
  parseWorkIds(content) {
    let workIds = [],
        dom = parse(content),
        $items = dom.querySelectorAll('.display_editable_works .image-item');

    if ($items && $items.length > 0) {
      $items.forEach($item => {
        let $work = $item.querySelector('a.work');

        if ($work) {
          let path = $work.getAttribute('href');

          if (path) {
            let matches = path.match(/(\d+)$/);

            if (matches) {
              workIds.push(matches[1]);
            }
          }
        }
      });
    }

    return workIds;
  }

  /**
   * @returns {Promise.<string[],Error>}
   */
  requestAllWorks() {
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
          resolve(this.parseWorkIds(body));
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
}

export default BookmarkProvider;
