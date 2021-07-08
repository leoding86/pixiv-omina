import BaseService from './BaseService';
import WindowManager from '@/modules/WindowManager';
import {
  debug
} from '@/global';

class ErrorService extends BaseService {
  /**
   * @property
   * @type {ErrorService}
   */
  static instance;

  /**
   * @property
   * @type {string}
   */
  static channel = 'error-service';

  constructor() {
    super();

    process.on('uncaughtException', this.handleException.bind(this));
  }

  /**
   * @returns {ErrorService}
   */
  static getService() {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }

    return ErrorService.instance;
  }

  /**
   * Get renderer response channel
   * @param {string} name
   */
  responseChannel(name) {
    return ErrorService.channel + `:${name}`;
  }

  /**
   * Handle exception
   * @param {Error} error
   */
  handleException(error) {
    debug.log(error);

    console.error(error);

    WindowManager.getWindow('app').webContents.send(this.responseChannel('error'), error.message);
  }
}

export default ErrorService;
