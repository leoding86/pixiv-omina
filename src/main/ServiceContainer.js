import SettingService from '@/services/SettingService';
import UserService from '@/services/UserService';
import DownloadService from '@/services/DownloadService';
import DebugService from '@/services/DebugService';

/**
 * @class
 */
class ServiceContainer {

  /**
   * @constructor
   */
  constructor() {
    this.services = new Map();

    /**
     * Attach DebugServce's instance to global variable
     */
    global.debug = DebugService.instance;
  }

  /**
   * @type {ServiceContainer}
   */
  static instance;

  /**
   * @returns {ServiceContainer}
   */
  static getContainer() {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
      ServiceContainer.instance.services
        .set('debug', DebugService.getService())
        .set('setting', SettingService.getService())
        .set('user', UserService.getService())
        .set('download', DownloadService.getService());
    }

    return ServiceContainer.instance;
  }

  /**
   *
   * @param {string} name service name
   * @returns {(SettingService|DownloadService|UserService|DebugService)}
   */
  static getService(name) {
    if (ServiceContainer.instance.services.has(name)) {
      return ServiceContainer.instance.services.get(name);
    }
  }
}

export default ServiceContainer;
