import MangaProvider from './MangaProvider';

class IllustrationProvider extends MangaProvider {

  /**
   *
   * @param {object} options
   * @param {string} options.url
   * @param {object} options.context
   * @param {string|number} options.context.id
   * @returns {IllustrationProvider}
   */
  static createProvider({ url, context }) {
    return new IllustrationProvider({ url, context });
  }
}

export default IllustrationProvider;
