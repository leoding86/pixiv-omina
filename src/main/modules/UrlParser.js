import UrlBuilder from '@/../utils/UrlBuilder';

class UrlParser {

  static pixivWorkUrlPatterns = [
    /^https?:\/{2}www\.pixiv\.net\/(?:[a-z]+\/)?artworks\/(\d+)(?:\?.*)?$/
  ];

  static pixivUserUrlPatterns = [
    /^https?:\/{2}www\.pixiv\.net\/member(?:_illust)?\.php\?id=(\d+)(&.*)?$/,
    /^https:\/\/www\.pixiv\.net\/(?:[a-z]+\/)?users\/(\d+)/
  ];

  static getWorkIdFromUrl(url) {
    for (let i = 0, l = UrlParser.pixivWorkUrlPatterns.length; i < l; i++) {
      let matches = url.match(UrlParser.pixivWorkUrlPatterns[i]);

      if (matches) {
        return matches[1];
      }
    }

    return;
  }

  static getPixivUserUrlInfo(url) {
    for (let i = 0, l = UrlParser.pixivUserUrlPatterns.length; i < l; i++) {
      let matches = url.match(UrlParser.pixivUserUrlPatterns[i]);

      if (matches) {
        return {
          userId: matches[1],
          userUrl: url,
          userProfileAllUrl: UrlBuilder.getUserProfileAllUrl(matches[1])
        }
      }
    }

    return;
  }
}

export default UrlParser;
