import EventEmitter from 'events';

/**
 * @class
 */
class EventBus extends EventEmitter {
  /**
   * @type {EventBus}
   */
  static instance;

  /**
   *
   * @returns {EventBus}
   */
  static getDefault() {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }

    return EventBus.instance;
  }
}

export default EventBus;
