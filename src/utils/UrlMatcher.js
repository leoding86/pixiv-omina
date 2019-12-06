class UrlMatcher {
  static matcherList = [
    'isPixivWork',
    'isPixivUser'
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

  static isPixivUser(url) {
    return /^https?:\/{2}www\.pixiv\.net\/member\.php\?id=(\d+)(&.*)?$/.test(url);
  }
}

export default UrlMatcher;
