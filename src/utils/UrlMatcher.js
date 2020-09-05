class UrlMatcher {
  static matcherList = [
    'isPixivWork',
    'isPixivUser',
    'isPixivComicEpisode',
    'isPixivComicWork'
  ]

  static isMatch(url) {
    let matched = false;

    UrlMatcher.matcherList.forEach(method => {
      if (typeof UrlMatcher[method] === 'function' && UrlMatcher[method].call(null, url)) {
        matched = true;
      }
    });

    return matched;
  }

  static isPixivWork(url) {
    return /^https?:\/{2}www\.pixiv\.net\/([a-z]+\/)?artworks\/[\d]+(\?.*)?$/.test(url);
  }

  /**
   *
   * @param {String} url avaliable urls has: https://www.pixiv.net/member_illust.php?id=123456
   *                                         https://www.pixiv.net/member.php?id=123456
   */
  static isPixivUser(url) {
    return /^https?:\/{2}www\.pixiv\.net\/member(?:_illust)?\.php\?id=(\d+)(&.*)?$/.test(url);
  }

  static isPixivComicEpisode(url) {
    return /^https?:\/\/comic\.pixiv\.net\/viewer\/stories\/(?<id>\d+)/.test(url);
  }

  static isPixivComicWork(url) {
    return /^https?:\/\/comic\.pixiv\.net\/works\/(?<id>\d+)/.test(url);
  }
}

export default UrlMatcher;
