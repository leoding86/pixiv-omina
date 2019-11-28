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

    this.services
      .set('setting', SettingService.getService())
      .set('user', UserService.getService())
      .set('download', DownloadService.getService())
      .set('debug', DebugService.getService());

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
    }

    return ServiceContainer.instance;
  }

  static getService(name) {
    if (ServiceContainer.instance.services.has(name)) {
      return ServiceContainer.instance.services.get(name);
    }
  }
}

export default ServiceContainer;
