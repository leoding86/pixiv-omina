import SettingService from '@/services/SettingService';
import UserService from '@/services/UserService';
import DownloadService from '@/services/DownloadService';

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
      .set('download', DownloadService.getService());
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
