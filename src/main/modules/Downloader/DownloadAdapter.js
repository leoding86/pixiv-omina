import {
  PixivGeneralArtworkProvider,
  PixivUserProvider,
  PixivComicEpisodeProvider,
  PixivNovelProvider,
  PixivNovelSeriesProvider,
  PixivComicWorkProvider
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
    },
    {
      provider: PixivNovelProvider,
      patterns: [
        /^https?:\/\/www\.pixiv\.net\/novel\/show\.php\?id=(?<id>\d+)/i
      ]
    },
    {
      provider: PixivNovelSeriesProvider,
      patterns: [
        /^https?:\/\/www\.pixiv\.net\/novel\/series\/(?<id>\d+)/i
      ]
    },
    {
      provider: PixivComicEpisodeProvider,
      patterns: [
        /^https?:\/\/comic\.pixiv\.net\/viewer\/stories\/(?<id>\d+)/
      ]
    },
    {
      provider: PixivComicWorkProvider,
      patterns: [
        /^https?:\/\/comic\.pixiv\.net\/works\/(?<id>\d+)/
      ]
    }
  ];

  /**
   *
   * @param {string} src
   * @returns {PixivUserProvider|PixivGeneralArtworkProvider|PixivBookmarkProvider}
   * @throws {Error}
   */
  static getProvider(src) {
    for (let i = 0, l = DownloadAdapter.matchMaps.length; i < l; i++) {
      let match = DownloadAdapter.matchMaps[i];
      for (let j = 0; j < match.patterns.length; j++) {
        let matches = src.match(match.patterns[j]);
        if (!!matches) {
          return match.provider.createProvider({
            url: src,
            context: matches['groups'],
          });
        }
      }
    }

    throw Error(`cannot get provider via ${src}`);
  }

  /**
   * Extend match mapper
   *
   * @param {Object} arguments
   * @param {BaseProvider} arguments.provider
   * @param {String[]} arguments.patterns
   */
  static extendMap({ provider, patterns }) {
    DownloadAdapter.matchMaps.push({
      provider,
      patterns
    });
  }
}

export default DownloadAdapter;
