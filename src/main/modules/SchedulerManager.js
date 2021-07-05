import EventEmitter from events;
import md5 from 'md5';
import BaseScheduler from './BaseScheduler';

class SchedulerManager extends EventEmitter {
  /**
   * @type {SchedulerManager}
   */
  static instance;

  /**
   * @constructor
   */
  constructor() {
    super();

    /**
     * @type {Map.<string, BaseScheduler}
     */
    this.schedulers = new Map();

    /**
     * @type {Map.<string, BaseScheduler.createScheduler}
     */
    this.avaliableSchedulers = new Map();
  }

  /**
   * @static
   * @returns {SchedularManager}
   */
  static getDefault() {
    if (!SchedulerManager.instance) {
      SchedulerManager.instance = new SchedulerManager();
    }

    return SchedulerManager.instance;
  }

  /**
   *
   * @param {string} name
   * @param {Function} schedulerConstructor
   */
  addAvaliableScheduler(name, schedulerConstructor) {
    if (!this.avaliableSchedulers.has(name)) {
      this.avaliableSchedulers.set(name, schedulerConstructor);
    }
  }

  /**
   *
   * @param {string} name
   */
  deleteAvaliableScheduler(name) {
    if (this.avaliableSchedulers.has(name)) {
      this.avaliableSchedulers.delete(name);
    }
  }

  /**
   *
   * @param {string} name
   * @param {object} constructArgs
   * @returns {string}
   */
  getSchedulerId(name, constructArgs) {
    let parts = [name];

    Object.keys(constructArgs).forEach(key => {
      parts.push(key);
    });

    return md5(parts.join(':'));
  }

  /**
   *
   * @param {string} name
   * @param {object} constructArgs
   */
  addScheduler(name, constructArgs) {
    let schedulerConstructor = this.avaliableSchedulers.get(name);

    if (schedulerConstructor) {
      let id = this.getSchedulerId(name, constructArgs);

      if (!this.schedulers.has(id)) {
        /**
         * Add id property to construct arguments
         */
        constructArgs.id = id;

        /**
         * If there is any error is raised, then the error will be catch and handled by ErrorService
         */
        this.schedulers.set(id, schedulerConstructor.createScheduler(constructArgs));

        /**
         * Start the scheduler
         */
        this.startScheduler(id);
      }
    }

    throw new Error(`Cannot create scheduler using name: ${name} and args: ${JSON.stringify(constructArgs)}`);
  }

  /**
   *
   * @param {string} id
   */
  startScheduler(id) {
    if (this.schedulers.has(id)) {
      this.schedulers.get(id).start();
    }
  }

  /**
   *
   * @param {string} id
   */
  removeScheduler(id) {
    this.stopScheduler(id);
  }

  /**
   *
   * @param {string} id
   */
  stopScheduler(id) {
    if (this.schedulers.has(id)) {
      this.schedulers.get(id).stop();
    }
  }

  /**
   *
   * @param {string} id
   */
  clearScheduler(id) {
    if (this.schedulers.has(id)) {
      this.schedulers.get(id).clear();
    }
  }
}

export default SchedulerManager;
