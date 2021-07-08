import DownloadAdapter from '@/modules/Downloader/DownloadAdapter';
import ScheduleTaskPool from '@/modules/ScheduleTaskPool';
import TaskScheduler from '@/modules/TaskScheduler';
import Exposer from '@/modules/Exposer';

/**
 * @typedef TaskArgumentsConfig
 * @property {string} name
 * @property {string} fieldType
 * @property {string|number} [default]
 *
 * @typedef TaskConfig
 * @property {string} key
 * @property {string} name
 * @property {Function} Task
 * @property {TaskArgumentsConfig[]} argumentsConfig
 */

/**
 * @class
 */
class BasePlugin {
  /**
   * @constructor
   */
  constructor() {
    /**
     * @type {string}
     */
    this.entryFile = '';

    /**
     * @type {string}
     */
    this.id = '';

    /**
     * @property {RegExp[]}
     */
    this.patterns = [];

    /**
     * @property {string}
     */
    this.loginUrl = null;

    /**
     * @property {string}
     */
    this.icon = null;

    /**
     * @property {string}
     */
    this.title = null;

    /**
     * @property {RegExp[]}
     */
    this.requestUrlPatterns = [];

    /**
     * @type {TaskConfig}
     */
    this.taskConfig = null
  }

  /**
   * Create a provider
   * @param {{ url: string, context: *}} param0
   */
  createProvider({ url, context }) {
    throw new Error('Method createProvider has not been implemented');
  }

  /**
   * Override request headers if necessary
   * @param {{ url: string, context: *, requestHeaders: object }} args
   * @returns {object}
   */
  requestHeadersOverrider({ url, context, requestHeaders }) {
    return requestHeaders;
  }

  /**
   * Override response header if necessary
   * @param {{ url: string, context: object, responseHeaders: object }} args
   * @returns {object}
   */
  responseHeadersOverrider({ url, context, responseHeaders }) {
    return responseHeaders;
  }

  /**
   * Call when remove a plugin
   * @returns {void}
   */
  uninstall() {
    //
  }
}

Exposer.expose('omina.BasePlugin', BasePlugin);

export default BasePlugin;
