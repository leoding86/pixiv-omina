import BaseProvider from './BaseProvider';
import EpisodeDownloader from '@/modules/Downloader/WorkDownloader/PixivComic/EpisodeDownloader';

class EpisodeProvider extends BaseProvider {

  /**
   *
   * @param {Object} options
   * @param {string} options.url
   * @param {{id:string|number, workId:null|string|number}} options.context
   */
  constructor({ url, context }) {
    super({ url, context });
  }

  /**
   *
   * @param {Object} options
   * @param {string} [options.url=null]
   * @param {{id:string|number, workId:null|string|number}} options.context
   */
  static createProvider({ url = null, context }) {
    if (url === null && context.id) {
      url = EpisodeProvider.getEpisodeUrl(context.id);
    }

    return new EpisodeProvider({ url, context });
  }

  get id() {
    return [this.providerName, 'episode', this.context.id].join(':');
  }

  static getEpisodeUrl(id) {
    return `https://comic.pixiv.net/viewer/stories/${id}`;
  }

  /**
   * Create a episode downloader
   * @param {{ saveTo: string, options: object }} args
   */
  createDownloader({ saveTo, options }) {
    return EpisodeDownloader.createDownloader({
      url: this.url,
      saveTo,
      options,
      provider: this
    });
  }
}

export default EpisodeProvider;
