import EventEmitter from 'events';

/**
 * @class
 * @abstract
 */
class BaseTask extends EventEmitter {
  /**
   * Task idle statue
   * @var {number}
   */
  static IDLE_STATUS = 0;

  /**
   * Task process status
   * @var {number}
   */
  static PROCESS_STATUS = 1;

  /**
   * Task pausing status
   * @var {number}
   */
  static PAUSING_STATUS = 2;

  /**
   * @constructor
   */
  constructor() {
    super();
    this.progress = 0;
    this.status = BaseTask.IDLE_STATUS;
    this.statusMessage = '';
    this.jobsLeft = 0;
  }

  /**
   * Get task status
   * @returns {Number}
   */
  getStatus() {
    return this.status;
  }

  /**
   * Get task status message
   * @returns {String}
   */
  getStatusMessage() {
    return this.statusMessage;
  }

  /**
   * Get the number of jobs left in current task
   * @returns {Number}
   */
  getJobsLeft() {
    return this.jobsLeft;
  }

  /**
   * Get task name
   * @abstract
   * @throws
   */
  getName() {
    throw new Error(`Method "getName" is not implemented`);
  }

  /**
   * Get the progress of the task
   * @returns {Number}
   */
  getProgress() {
    return this.progress;
  }

  /**
   * @abstract
   * @throws
   */
  addPayload() {
    throw new Error('Method "addPayload" is not implemented');
  }

  /**
   * @abstract
   * @throws
   */
  start() {
    throw new Error('Method "start" is not implemented');
  }

  /**
   * @abstract
   * @throws
   */
  pause() {
    throw new Error('Method "pause" is not implemented');
  }

  /**
   * @abstract
   * @throws
   */
  stop() {
    throw new Error('Method "stop" is not implemented');
  }

  /**
   * Update task status to process status
   * @param {string} [message='PROCESSING']
   * @returns {void}
   */
  setStart(message = 'PROCESSING') {
    this.status = BaseTask.PROCESS_STATUS;
    this.statusMessage = message;
    this.emit('progress', this);
  }

  /**
   * Update task status to stop status
   * @param {string} [message='STOP']
   * @returns {void}
   */
  setStop(message = 'STOP') {
    this.status = BaseTask.IDLE_STATUS;
    this.statusMessage = message;
    this.emit('paused', this);
  }

  /**
   * Update task status to pausing status
   * @param {string} [message='PAUSING']
   * @returns {void}
   */
  setPausing(message = 'PAUSING') {
    this.status = BaseTask.PAUSING_STATUS;
    this.statusMessage = message;
    this.emit('pausing', this);
  }

  /**
   * Update task status to pause status
   * @param {string} [message='PAUSE']
   * @returns {void}
   */
  setPause(message = 'PAUSE') {
    this.status = BaseTask.IDLE_STATUS;
    this.statusMessage = message;
    this.emit('paused', this);
  }

  /**
   * Update task status to process status
   * @param {string} message
   */
  setProcess(message = 'PROCESS') {
    this.status = BaseTask.PROCESS_STATUS,
    this.statusMessage = message;
    this.emit('progress', this);
  }

  /**
   * Update task status to finish status
   * @param {string} message
   * @returns {void}
   */
  setFinish(message = 'FINISH') {
    this.status = BaseTask.IDLE_STATUS;
    this.statusMessage = message;
    this.emit('progress', this);
  }

  /**
   * Output task infomations
   * @returns {{name: String, progress: Number, status: Number, statusMessage: String, jobsLeft: Number}}
   */
  toJson() {
    return {
      name: this.getName(),
      progress: this.getProgress(),
      status: this.getStatus(),
      statusMessage: this.getStatusMessage(),
      jobsLeft: this.getJobsLeft()
    };
  }
}

export default BaseTask;
