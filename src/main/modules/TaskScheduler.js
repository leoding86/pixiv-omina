import path from 'path';
import fs from 'fs-extra';
import EventEmitter from 'events';
import ScheduleTaskPool from '@/modules/ScheduleTaskPool';
import Schedule from '@/modules/Schedule';
import { GetPath } from './Utils';
import { debug } from '@/global';
import EventBus from '@/modules/EventBus';

/**
 * @event Schedule#schedule_updated
 * @type {Schedule}
 */

/**
 * @class
 */
class TaskScheduler extends EventEmitter {
  /**
   * @type {TaskScheduler}
   */
  static instance;

  /**
   * @constructor
   */
  constructor() {
    super();

    /**
     * @type {Map.<string, Schedule}
     */
    this.schedules = new Map();

    /**
     * @type {ScheduleTaskPool}
     */
    this.taskPool = ScheduleTaskPool.getDefault();

    /**
     * @type {string}
     */
    this.configFile = path.join(GetPath.userData(), 'config', 'schedules');

    /**
     * @type {object}
     */
    this.config = {};

    this.initConfig();
  }

  /**
   * @static
   * @returns {TaskScheduler}
   */
  static getDefault() {
    if (!TaskScheduler.instance) {
      TaskScheduler.instance = new TaskScheduler();
    }

    return TaskScheduler.instance;
  }

  /**
   * Initial config and store it in property config
   * @returns {void}
   */
  initConfig() {
    fs.ensureFileSync(this.configFile);

    let content = fs.readFileSync(this.configFile);

    try {
      this.config = JSON.parse(content);
    } catch (error) {
      debug.log('Schedules config not found');
    }
  }

  /**
   *
   * @param {object} cfg
   */
  restoreSchedule(cfg) {
    let schedule = Schedule.createSchedule(cfg)

    schedule.state = cfg.state;
    schedule.latestRunAt = cfg.latestRunAt;
    schedule.latestRunResult = cfg.latestRunResult;
    schedule.latestRunResultMessage = cfg.latestRunResultMessage;
    schedule.id = cfg.id;

    try {
      this.addSchedule(schedule, !!cfg.stop);
    } catch (error) {
      debug.log(error);
    }
  }

  /**
   * Restore all saved schedules
   * @returns {void}
   */
  restoreSchedules() {
    if (this.config && Array.isArray(this.config) && this.config.length > 0) {
      this.config.forEach(cfg => {
        this.restoreSchedule(cfg);
      });
    }
  }

  /**
   * Emit schedule_updated event
   * @param {Schedule} schedule
   */
  emitScheduleUpdated(schedule) {
    this.emit('schedule_updated', schedule);
    this.updateScheduleConfig(schedule);
  }

  /**
   *
   * @param {Schedule} schedule
   */
  handleScheduleError(schedule) {
    this.emitScheduleUpdated(schedule);
  }

  /**
   *
   * @param {Schedule} schedule
   */
  handleScheduleStart(schedule) {
    this.emitScheduleUpdated(schedule);
  }

  /**
   *
   * @param {Schedule} schedule
   */
  handleScheduleSuccess(schedule) {
    this.emitScheduleUpdated(schedule);
  }

  /**
   * @param {Schedule} schedule
   */
  bindScheduleListeners(schedule) {
    schedule.on('start', this.handleScheduleStart);
    schedule.on('success', this.handleScheduleSuccess);
    schedule.on('error', this.handleScheduleError);
  }

  /**
   * Save config property to config file
   * @returns {void}
   */
  saveConfig() {
    fs.writeFileSync(this.configFile, JSON.stringify(this.config));
  }

  /**
   *
   * @param {Schedule} schedule
   */
  addScheduleConfig(schedule) {
    this.config[schedule.id] = schedule.toJson();
    this.saveConfig();
  }

  /**
   *
   * @param {Schedule} schedule
   * @param {object} [data={}]
   */
  updateScheduleConfig(schedule, data = {}) {
    if (this.config[schedule.id]) {
      this.config[schedule.id] = Object.assign(schedule.toJson(), data);
      this.saveConfig();
    }
  }

  /**
   *
   * @param {Schedule} schedule
   */
  deleteScheduleConfig(schedule) {
    delete this.config[schedule.id];
    this.saveConfig();
  }

  /**
   * @param {Schedule} schedule
   * @param {boolean} [notStart=false]
   * @throws {Error}
   */
  addSchedule(schedule, notStart = false) {
    if (!this.schedules.has(schedule.id)) {
      schedule.setTaskScheduler(this);

      this.bindScheduleListeners(schedule);

      this.schedules.set(schedule.id, schedule);

      /**
       * Check if running the scheduler task immediately
       */
      if (!notStart && schedule.runImmediately) {
        this.startSchedule(schedule.id);
      }

      this.addScheduleConfig(schedule);

      return;
    } else {
      throw new Error(`Same schedule task exists`);
    }
  }

  /**
   *
   * @returns {Map.<string, Schedule}
   */
  getAllSchedules() {
    return this.schedules;
  }

  /**
   *
   * @param {string} id
   */
  startSchedule(id) {
    if (this.scheduler.has(id)) {
      let schedule = this.schedules.get(id);

      this.updateScheduleConfig(schedule, { stop: false });
    }
  }

  /**
   *
   * @param {string} id
   */
  deleteSchedule(id) {
    if (this.schedules.has(id)) {
      let schedule = this.schedules.get(id);

      /**
       * Try to destroy schedule, if there is any error raised, then the
       * deletion will be unsuccessful.
       */
      schedule.delete();

      /**
       * Delete schedule from schedule pool and update configuration
       */
      this.schedules.delete(id);
      this.deleteScheduleConfig(schedule);
    }
  }

  /**
   *
   * @param {string} id
   */
  stopSchedule(id) {
    if (this.schedules.has(id)) {
      try {
        this.schedules.get(id).stop();
      } catch (error) {
        EventBus.getDefault().emit('error-need-notificate', error);
      }

      this.updateScheduleConfig(id);
    }
  }
}

export default TaskScheduler;
