import BaseProvider from './BaseProvider';
import UserDownloader from '../../WorkDownloader/Pixiv/UserDownloader';

class UserProvider extends BaseProvider {
  constructor({ url, context }) {
    super({ url, context });
  }

  /**
   *
   * @param {object} options
   * @param {string} options.url
   * @param {object} options.context
   * @param {string|number} options.context.id
   * @returns {UserProvider}
   */
  static createProvider({ url, context }) {
    return new UserProvider({ url, context });
  }

  /**
   * @returns {string}
   */
  get id() {
    return [this.providerName, 'user', this.context.id].join(':');
  }

  createDownloader({ saveTo, options }) {
    return UserDownloader.createDownloader({
      url: this.url,
      saveTo, options,
      provider: this
    });
  }
}

export default UserProvider;
