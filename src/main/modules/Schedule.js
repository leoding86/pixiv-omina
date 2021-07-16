import EventEmitter from 'events';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import TaskScheduler from '@/modules/TaskScheduler';
import ScheduleTask from '@/modules/ScheduleTask';
import ScheduleTaskNotFoundError from '@/errors/ScheduleTaskNotFoundError';

/**
 * @typedef {object} constructArguments
 * @property {string} taskKey
 * @property {string} name
 * @property {string} [id]
 * @property {number} [mode=2]
 * @property {number} [interval=3600000]
 * @property {string} [runAt=02:00:00]
 * @property {boolean} [repeat=false]
 * @property {boolean} [runImmediately=false]
 * @property {object} [taskConstructorArguments=null]
 * @property {ScheduleTask} task
 */

/**
 * @event Schedule#start
 * @type {Schedule}
 */

/**
 * @event Schedule#complete
 * @type {Schedule}
 */

/**
 * @event Schedule#error
 * @type {Schedule}
 */

/**
 * @class
 */
class Schedule extends EventEmitter {
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
   * @type {number}
   */
  static STOP_STATE = 3;

  /**
   * @type {number}
   */
  static NOT_START_STATUS = 0;

  /**
   * @type {number}
   */
  static TASK_FAILURE_STATUS = 1;

  /**
   * @type {number}
   */
  static TASK_COMPLETE_STATUS = 2;

  /**
   * @type {number}
   */
  static TASK_ABORTED_STATUS = 3;

  /**
   * @type {number}
   */
  static INTERVAL_MODE = 1;

  /**
   * @type {number}
   */
  static RUN_AT_MODE = 2;

  /**
   * @constructor
   * @param {constructArguments} args
   */
  constructor(args) {
    super();

    /**
     * @type {string}
     */
    this.name = args.name || ('Task ' + Date.now());

    /**
     * @type {number}
     */
    this.mode = args.mode || Schedule.RUN_AT_MODE;

    /**
     * @type {number}
     */
    this.interval = args.interval || 3600 * 1000;

    /**
     * @type {string}
     */
    this.runAt = args.runAt || '02:00:00';

    /**
     * @type {boolean}
     */
    this.repeat = args.repeat || false;

    /**
     * @type {number}
     */
    this.runImmediately = args.runImmediately || false;

    /**
     * @type {object|null}
     */
    this.taskConstructorArguments = args.taskConstructorArguments || null;

    /**
     * @type {string}
     */
    this.taskKey = args.taskKey || null;

    /**
     * @type {ScheduleTask}
     */
    this.task = null;

    /**
     * @type {string}
     */
    this.id = args.id || uuidv4();

    /**
     * @type {number}
     */
    this.latestRunResult = Schedule.NOT_START_STATUS;

    /**
     * @type {number}
     */
    this.latestRunAt = 0;

    /**
     * @type {string}
     */
    this.latestRunResultMessage = '';

    /**
     * @type {number}
     */
    this.timeout = null;

    /**
     * @type {number}
     */
    this.nextRunAt = 0;

    /**
     * @type {number}
     */
    this.state = Schedule.IDLE_STATE;

    /**
     * @type {TaskScheduler}
     */
    this.taskScheduler = null;

    this.boot();
  }

  /**
   *
   * @param {constructArguments} args
   * @returns {Schedule}
   */
  static createSchedule(args) {
    return new Schedule(args);
  }

  /**
   *
   * @param {TaskScheduler} taskScheduler
   */
  setTaskScheduler(taskScheduler) {
    this.taskScheduler = taskScheduler;
  }

  /**
   *
   * @returns {number}
   */
  getNextRunAt() {
    if (this.mode === Schedule.RUN_AT_MODE) {
      let parts = this.runAt.split(':');

      let date = moment().set('hour', parseInt(parts[0]))
                         .set('minute', parseInt(parts[1]))
                         .set('second', parseInt(parts[2]));

      if (date.unix() <= moment().unix()) {
        date = date.add(1, 'day');
      }

      return date.unix();
    } else if (this.mode === Schedule.INTERVAL_MODE) {
      return moment().unix() + this.interval;
    }
  }

  /**
   * Plan the next run of the schedule
   * @returns {void}
   */
  planNextRun() {
    this.state = Schedule.IDLE_STATE;

    this.nextRunAt = this.getNextRunAt();

    this.timeout = setTimeout(
      this.start.bind(this),
      (this.nextRunAt - moment().unix()) * 1000
    );
  }

  /**
   *
   * @returns {boolean}
   */
  canStart() {
    return this.state === Schedule.IDLE_STATE;
  }

  /**
   * Boot schedule
   * @returns {void}
   */
  boot() {
    this.planNextRun();
  }

  /**
   *
   * @param {{status:number, result:string}} param0
   */
  updateLatestRunResult({ status, result }) {
    this.state = Schedule.IDLE_STATE
    this.latestRunResult = status;
    this.latestRunResultMessage = result;
  }

  /**
   * Run current task
   * @returns {Promise.<any,any>}
   */
  runTask() {
    return new Promise((resolve, reject) => {
      this.latestRunAt = moment().unix();

      this.state = Schedule.PROCESSING_STATE;

      this.emit('start', this);

      /**
       * Find task constructor
       */
      let TaskClass = this.taskScheduler.taskPool.getTask(this.taskKey);

      if (!TaskClass) {
        let error = new ScheduleTaskNotFoundError();

        this.updateLatestRunResult({ status: Schedule.TASK_FAILURE_STATUS, result: error.message });

        /**
         * Fire error event
         */
        this.emit('error', error);

        reject(error);

        return;
      }

      /**
       * Try to create task instance
       */
      try {
        this.task = TaskClass.createTask(this.taskConstructorArguments);
      } catch (error) {
        this.updateLatestRunResult({ status: Schedule.TASK_FAILURE_STATUS, result: error.message });

        this.emit('error', this);
      }

      /**
       * Start task
       */
      this.task.start().then(result => {
        this.updateLatestRunResult({ status: Schedule.TASK_COMPLETE_STATUS, result: (result && result.resultMessage) ? result.resultMessage : '_done'});

        /**
         * Fire complete event
         */
        this.emit('complete', this);

        resolve(this.task);
      }).catch(error => {
        this.updateLatestRunResult({ status: Schedule.TASK_FAILURE_STATUS, result: error ? error.message : '_error' });

        this.emit('error', this);

        reject(error);
      });
    });
  }

  /**
   * @fires Schedule#complete
   * @fires Schedule#error
   *
   * @returns {void}
   */
  start() {
    if (this.state === Schedule.STOP_STATE) {
      return;
    }

    this.runTask().then(task => {
      //
    }).catch(error => {
      //
    }).finally(() => {
      if (this.repeat) {
        this.planNextRun();
      }
    });
  }

  /**
   * Stop running task. Should call this method in try catch
   *
   * @returns {void}
   */
  stop() {
    this.state = Schedule.STOP_STATE;

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    if (this.task) {
      this.latestRunResult = Schedule.TASK_ABORTED_STATUS;

      this.latestRunResultMessage = '_user_abort';

      /**
       * Should consider that there'll maybe any exception happens when schedule try
       * to stop the task
       */
      this.task.stop();
    }
  }

  /**
   * Stop running task and do some clear up if there is clearup method in Task class
   *
   * @param {boolean} clearup
   * @returns {void}
   *
   * @throws {Error}
   */
  delete(clearup = false) {
    this.stop();

    let taskClass = this.taskScheduler.taskPool.getTask(this.taskKey);

    if (!taskClass) {
      throw new Error('_cannot_found_task');
    }

    if (clearup && typeof task.clearup === 'function') {
      try {
        task.clearup(this.taskConstructorArguments);
      } catch (error) {
        throw new Error('_clearup_may_not_complete');
      }
    }
  }

  /**
   * @returns {object}
   */
  toJson() {
    return {
      name: this.name,
      taskKey: this.taskKey,
      state: this.state,
      mode: this.mode,
      interval: this.interval,
      runAt: this.runAt,
      nextRunAt: this.nextRunAt,
      repeat: this.repeat,
      taskArguments: this.taskConstructorArguments,
      id: this.id,
      latestRunAt: this.latestRunAt,
      latestRunResult: this.latestRunResult,
      latestRunResultMessage: this.latestRunResultMessage,
      runImmediately: this.runImmediately
    };
  }
}

export default Schedule;
