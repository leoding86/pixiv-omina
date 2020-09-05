import moment from 'moment';
import md5 from 'md5';

class RequestHeadersOverrider {

  static instance;

  constructor() {
    this.maps = [
      {
        patterns: [
          /^https?:\/\/img-comic\.pximg\.net\//i
        ],
        requestHeaders({ url, context = null }) {
          return {
            'referer': 'https://comic.pixiv.net/'
          }
        }
      },
      {
        patterns: [
          /^https:\/\/comic\.pixiv\.net\/api\/app\/episodes\/(?<id>\d+)\/read/i
        ],
        requestHeaders({ url, context = null }) {
          let time = moment().format().toString();

          return {
            'referer': `https://comic.pixiv.net/viewer/stories/${context.id}`,
            'x-client-hash' : md5(time + ['m', 'A', 't', 'W', '1', 'X', '8', 'S', 'z', 'G', 'S', '8', '8', '0', 'f', 's', 'j', 'E', 'X', 'l', 'M', '7', '3', 'Q', 'p', 'S', '1', 'i', '4', 'k', 'U', 'M', 'B', 'h', 'y', 'h', 'd', 'a', 'Y', 'y', 'S', 'k', '8', 'n', 'W', 'z', '5', '3', '3', 'n', 'r', 'E', 'u', 'n', 'a', 'S', 'p', 'l', 'g', '6', '3', 'f', 'z', 'T'].join('')),
            'x-client-time' : time,
            'x-requested-with' : 'pixivcomic'
          }
        }
      },
      {
        patterns: [
          /^https:\/\/comic\.pixiv\.net\/api\/app\/works\/v3\/(?<id>\d+)/i
        ],
        requestHeaders({ url, context = null }) {
          return {
            'referer': `https://comic.pixiv.net/works/${context.id}`,
            'x-requested-with': `https://comic.pixiv.net/works/${context.id}`
          };
        }
      },
      {
        patterns: [
          /^https?:\/\/[a-z\d]+\.pximg\.net\//i,
          /^https?:\/\/[a-z\d]+\.pixiv\.net\//i
        ],
        requestHeaders({ url, context = null }) {
          return {
            'referer': 'https://www.pixiv.net/'
          }
        }
      }
    ];
  }

  /**
   * @returns {RequestHeadersOverrider}
   */
  static getDefault() {
    if (!RequestHeadersOverrider.instance) {
      RequestHeadersOverrider.instance = new RequestHeadersOverrider();
    }

    return RequestHeadersOverrider.instance;
  }

  /**
   *
   * @param {string} url
   * @param {null|Object} requestHeaders
   */
  getRequestHeaders(url, requestHeaders) {
    let overrideRequestHeaders;
    let breakout = false;

    if (requestHeaders['x-referer']) {
      overrideRequestHeaders = {
        'referer': requestHeaders['x-referer']
      };
      delete  ['x-referer'];
    }

    for (let i = 0; i < this.maps.length; i++) {
      for (let j = 0; j < this.maps[i].patterns.length; j++) {
        let matches = url.match(this.maps[i].patterns[j]);

        if (matches) {
          overrideRequestHeaders = this.maps[i].requestHeaders.call(null, {
            url,
            context: matches['groups']
          });

          breakout = true;
          break;
        }
      }

      if (breakout) {
        break;
      }
    }

    return overrideRequestHeaders ?
      Object.assign({}, requestHeaders, overrideRequestHeaders) :
      requestHeaders;
  }
}

export default RequestHeadersOverrider;
