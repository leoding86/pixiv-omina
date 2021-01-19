export default class StorageService {

  /**
   * @var StorageService
   */
  static instance;

  /**
   * @return {StorageService}
   */
  static getDefault() {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }

    return StorageService.instance;
  }

  /**
   * Set storage value
   *
   * @param {String} key
   * @param {Number|String|Object} value
   */
  setOffset(key, value) {
    if (typeof value === 'object' || Array.isArray(value)) {
      value = JSON.stringify(value);
    }

    localStorage.setItem(key, value);
  }

  /**
   * Get storage value
   *
   * @param {string} key
   */
  getOffset(key) {
    let value = localStorage.getItem(key);

    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
}
