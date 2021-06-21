import EventEmitter from 'events';
import BaseTask from '@/modules/Task/BaseTask';
import UgoiraConvertTask from '@/modules/Task/UgoiraConvertTask';

/**
 * This manager used to handle non-downloading task, like convert ugoira to gif, etc.
 *
 * @class
 */
class TaskManager extends EventEmitter {
  /**
   * @type {TaskManager}
   */
  static instance;

  /**
   * @constructor
   */
  constructor() {
    super();
    this.taskMaps = {};
    this.tasks = new Map();
    this.initTaskMaps();
  }

  initTaskMaps() {
    this.taskMaps[UgoiraConvertTask.name] = UgoiraConvertTask;
  }

  /**
   * Get TaskManager default instance
   *
   * @returns {TaskManager}
   */
  static getDefault() {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager();
    }

    return TaskManager.instance;
  }

  /**
   * The listener for handling task paused event
   * @param {BaseTask} task
   * @returns {void}
   */
  taskPausedListener(task) {
    this.emit('paused', task);
  }

  /**
   * The listener for hanlding task progress event
   * @param {BaseTask} task
   * @returns {void}
   */
  taskProgressListener(task) {
    this.emit('progress', task);
  }

  /**
   * Bind listeners to task events
   * @param {BaseTask} task
   * @returns {void}
   */
  bindListeners(task) {
    task.on('paused', this.taskPausedListener.bind(this));
    task.on('progress', this.taskProgressListener.bind(this));
  }

  /**
   *
   * @param {string} name
   * @returns {boolean}
   */
  hasTask(name) {
    return this.tasks.has(name);
  }

  /**
   *
   * @param {string} name
   * @param {any} payload
   * @returns {void}
   */
  addTaskPayload(name, payload) {
    let task = this.getTask(name);
    task.addPayload(payload);

    if (task.isIdle()) {
      task.start();
    }
  }

  /**
   *
   * @param {string} name
   * @returns {any|null}
   */
  getTask(name) {
    if (this.hasTask(name)) {
      return this.tasks.get(name);
    }

    if (this.taskMaps[name]) {
      let task = new this.taskMaps[name]();
      this.bindListeners(task);
      this.tasks.set(name, task)
      return task;
    }

    throw new Error(`Unkown task "${name}"`);
  }

  /**
   *
   * @param {string} name
   * @returns {void}
   */
  startTask(name) {
    this.getTask(name).start();
  }

  /**
   *
   * @param {string} name
   * @returns {void}
   */
  stopTask(name) {
    this.getTask(name).stop();
  }

  /**
   *
   * @param {string} name
   * @returns {void}
   */
  pauseTask(name) {
    this.stopTask(name);
  }
}

export default TaskManager;
