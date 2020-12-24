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
   * <br>                                    https://www.pixiv.net/member.php?id=123456
   * <br>                                    https://www.pixiv.net/users/6875333
   */
  static isPixivUser(url) {
    let patterns = [
      /^https:\/\/www\.pixiv\.net\/(?:[a-z]+\/)?users\/(\d+)/,
      /^https?:\/{2}www\.pixiv\.net\/member(?:_illust)?\.php\?id=(\d+)(&.*)?$/
    ];

    for (let i = 0; i < patterns.length; i++) {
      if (patterns[i].test(url)) {
        return true;
      }
    }

    return false;
  }

  static isPixivComicEpisode(url) {
    return /^https?:\/\/comic\.pixiv\.net\/viewer\/stories\/(?<id>\d+)/.test(url);
  }

  static isPixivComicWork(url) {
    return /^https?:\/\/comic\.pixiv\.net\/works\/(?<id>\d+)/.test(url);
  }
}

export default UrlMatcher;
