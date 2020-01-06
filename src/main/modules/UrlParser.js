import UrlBuilder from '@/../utils/UrlBuilder';

class UrlParser {

  static pixivWorkUrlPattern = /^https?:\/{2}www\.pixiv\.net\/(?:[a-z]+\/)?artworks\/(\d+)(?:\?.*)?$/;

  static pixivUserUrlPattern = /^https?:\/{2}www\.pixiv\.net\/member(?:_illust)?\.php\?id=(\d+)(&.*)?$/;

  static getWorkIdFromUrl(url) {
    let matches = url.match(UrlParser.pixivWorkUrlPattern);

    if (!matches) {
      return;
    }

    return matches[1];
  }

  static getPixivUserUrlInfo(url) {
    let matches = url.match(UrlParser.pixivUserUrlPattern);

    if (!matches) {
      return;
    }

    return {
      userId: matches[1],
      userUrl: url,
      userProfileAllUrl: UrlBuilder.getUserProfileAllUrl(matches[1])
    };
  }
}

export default UrlParser;
