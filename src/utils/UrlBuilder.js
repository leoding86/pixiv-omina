/**
 * @class
 */
class UrlBuilder {
  /**
   * Build work request url
   * @param {number|string} id Work id from Pixiv
   * @returns {string}
   */
  static getWorkUrl(id) {
    return `https://www.pixiv.net/artworks/${id}`;
  }

  /**
   * Build work info request url
   * @param {number|string} id Work id from Pixiv
   * @returns {string}
   */
  static getWorkInfoUrl(id) {
    return `https://www.pixiv.net/ajax/illust/${id}`;
  }

  static getAccountUnreadCountUrl() {
    return 'https://www.pixiv.net/rpc/index.php?mode=message_thread_unread_count';
  }

  /**
   *
   * @param {number|string} id
   */
  static getWorkPagesUrl(id) {
    return `https://www.pixiv.net/ajax/illust/${id}/pages`;
  }

  /**
   * @returns {string}
   */
  static getUserLogoutUrl() {
    return 'https://www.pixiv.net/logout.php';
  }
}

export default UrlBuilder;
