import SettingService from '@/services/SettingService';
import UpdateService from '@/services/UpdateService';
import UserService from '@/services/UserService';
import DownloadService from '@/services/DownloadService';
import TaskService from '@/services/TaskService';
import DebugService from '@/services/DebugService';
import PluginService from '@/services/PluginService';

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
        .set('update', UpdateService.getService())
        .set('user', UserService.getService())
        .set('download', DownloadService.getService())
        .set('task', TaskService.getService())
        .set('plugin', PluginService.getService());
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
