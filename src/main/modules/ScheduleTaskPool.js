/**
 * @typedef valueStructure
 * @property {string} name
 * @property {Function} Task
 */

/**
 * @class
 */
class ScheduleTaskPool {
  static instance;

  /**
   * @constructor
   */
  constructor() {
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
   * @param {{key: string, name: string, Task: Function}} data
   * @throws {Error}
   */
  addTask(data) {
    if (this.taskPool.has(data.key)) {
      throw new Error('_task_key_exists');
    }

    this.taskPool.set(data.key, data);
  }

  /**
   * Delete a task
   * @param {string} key
   */
  deleteTask(key) {
    if (this.taskPool.has(key)) {
      this.taskPool.delete(key);
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
}

export default ScheduleTaskPool;
