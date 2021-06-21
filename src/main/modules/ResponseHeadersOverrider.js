class ResponseHeadersOverrider {

  static instance;

  constructor() {
    this.maps = [{
      patterns: [
        /^https?:\/\/[a-z\d]+\.pximg\.net\//i,
        /^https?:\/\/[a-z\d]+\.pixiv\.net\//i
      ],
      responseHeaders({ url, responseHeaders }) {
        if (responseHeaders['x-frame-options'] || responseHeaders['X-Frame-Options']) {
          delete responseHeaders['x-frame-options'];
          delete responseHeaders['X-Frame-Options'];
        }
      }
    }];
  }

  /**
   * @returns {ResponseHeadersOverrider}
   */
  static getDefault() {
    if (!ResponseHeadersOverrider.instance) {
      ResponseHeadersOverrider.instance = new ResponseHeadersOverrider();
    }

    return ResponseHeadersOverrider.instance;
  }

  /**
   *
   * @param {string} url
   * @param {null|Object} responseHeaders
   */
  getResponseHeaders(url, responseHeaders) {
    let overridedResponseHeaders;
    let breakout = false;

    for (let i = 0; i < this.maps.length; i++) {
      for (let j = 0; j < this.maps[i].patterns.length; j++) {
        let matches = url.match(this.maps[i].patterns[j]);

        if (matches && typeof this.maps[i].responseHeaders === 'function') {
          overridedResponseHeaders = this.maps[i].responseHeaders.call(null, {
            url,
            responseHeaders
          });

          breakout = true;
          break;
        }
      }

      if (breakout) {
        break;
      }
    }

    return overridedResponseHeaders ?
      overridedResponseHeaders :
      responseHeaders;
  }

  extendMap(overrider) {
    if (overrider.id) {
      let oldOverrider = null;

      for (let i = 0; i < this.maps.length; i++) {
        if (this.maps[i].id && this.maps[i].id === overrider.id) {
          oldOverrider = this.maps[i];
          break;
        }
      }

      if (oldOverrider) {
        Object.assign(oldOverrider, overrider);
      } else {
        this.maps.push(overrider);
      }
    }
  }

  deleteOverrider(id) {
    for (let i = 0; i < this.maps.length; i++) {
      if (this.maps[i].id && this.maps[i].id === id) {
        this.maps.splice(i, 1);
        break;
      }
    }
  }
}

export default ResponseHeadersOverrider;
