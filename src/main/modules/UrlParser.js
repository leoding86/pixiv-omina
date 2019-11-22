class UrlParser {
  static getWorkIdFromUrl(url) {
    let matches = url.match(/^https:\/{2}www\.pixiv\.net\/[a-z]+\/artworks\/(\d+)/);

    if (!matches) {
      return;
    }

    return matches[2];
  }
}

export default UrlParser;
