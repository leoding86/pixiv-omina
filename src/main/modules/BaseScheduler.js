import EventEmitter from 'event';

class BaseScheduler extends EventEmitter {
  /**
   * @type {number}
   */
  static IDLE_STATE = 0;

  /**
   * @type {number}
   */
  static PROCESSING_STATE = 1;

  /**
   * @type {number}
   */
  static STOPPING_STATE = 2;

  /**
   *
   * @param {object} arguments
   * @returns {BaseScheduler}
   */
  static createScheduler(arguments) {
    throw new Error('Static method createScheduler has not been implements');
  }

  /**
   *
   * @returns {boolean}
   */
  canStart() {
    return this.status === BaseScheduler.IDLE_STATUS;
  }

  /**
   * @returns {void}
   */
  start() {
    throw new Error('Method start has not been implements');
  }

  /**
   * @returns {void}
   */
  stop() {
    throw new Error('Method stop has not been implements');
  }

  /**
   * @returns {void}
   */
  clear() {
    throw new Error('Method clear has not been implements');
  }
}

Exposer.expose('omina.BaseScheduler', BaseScheduler);

export default BaseScheduler;
