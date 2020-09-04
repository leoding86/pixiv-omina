import {
  PixivGeneralArtworkProvider,
  PixivUserProvider
} from './Providers';

class DownloadAdapter {
  static matchMaps = [
    {
      provider: PixivUserProvider,
      patterns: [
        /^https?:\/{2}www\.pixiv\.net\/member(?:_illust)?\.php\?id=(?<id>\d+)(?:&.*)?$/i,
        /^https?:\/{2}www\.pixiv\.net\/(?:[a-z]+\/)?users\/(?<id>\d+)(?:\?.*)?/i
      ]
    },
    {
      provider: PixivGeneralArtworkProvider,
      patterns: [
        /^https?:\/{2}www\.pixiv\.net\/(?:[a-z]+\/)?artworks\/(?<id>\d+)(?:\?.*)?$/i
      ]
    }
  ];

  /**
   *
   * @param {string} url
   * @returns {PixivUserProvider|PixivGeneralArtworkProvider}
   * @throws {Error}
   */
  static getProvider(url) {
    for (let i = 0, l = DownloadAdapter.matchMaps.length; i < l; i++) {
      for (let j = 0, n = DownloadAdapter.matchMaps[i].patterns.length; j < n; j++) {
        let matches = url.match(DownloadAdapter.matchMaps[i].patterns[j]);
        if (!!matches) {
          return DownloadAdapter.matchMaps[i].provider.createProvider({
            url,
            context: matches['groups']
          });
        }
      }
    }

    throw Error(`cannot get provider via url ${url}`);
  }
}

export default DownloadAdapter;
