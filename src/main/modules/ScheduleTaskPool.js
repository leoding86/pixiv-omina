import EventEmitter from "events";

/**
 * @typedef valueStructure
 * @property {string} key
 * @property {string} name
 * @property {Function} Task
 */

/**
 * @class
 */
class ScheduleTaskPool extends EventEmitter {
  static instance;

  /**
   * @constructor
   */
  constructor() {
    super();

    /**
     * @type {Map.<string,valueStructure>}
     */
    this.taskPool = new Map();
  }

  /**
   * @returns {ScheduleTaskPool}
   */
  static getDefault() {
    if (!ScheduleTaskPool.instance) {
      ScheduleTaskPool.instance = new ScheduleTaskPool();
    }

    return ScheduleTaskPool.instance;
  }

  /**
   * Add a task to pool
   * @fires ScheduleTaskPool#added
   * @type {object}
   *
   * @param {{key: string, name: string, Task: Function}} data
   * @throws {Error}
   */
  addTask(data) {
    if (this.taskPool.has(data.key)) {
      throw new Error('_task_key_exists');
    }

    this.taskPool.set(data.key, data);

    this.emit('added', data);
  }

  /**
   * Delete a task
   * @fires ScheduleTaskPool#deleted
   * @type {string}
   *
   * @param {string} key
   */
  deleteTask(key) {
    if (this.taskPool.has(key)) {
      this.taskPool.delete(key);

      this.emit('deleted', key);
    }
  }

  /**
   * Get a task
   * @param {string} key
   * @returns {Function|null}
   */
  getTask(key) {
    if (this.taskPool.has(key)) {
      return this.taskPool.get(key);
    } else {
      return null;
    }
  }

  /**
   *
   * @returns {valueStructure[]}
   */
  getTasks() {
    return Array.from(this.taskPool);
  }
}

export default ScheduleTaskPool;
