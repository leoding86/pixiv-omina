import { ipcMain } from 'electron';
import BaseService from './BaseService';
import TaskScheduler from '@/modules/TaskScheduler';
import WindowManager from '@/modules/WindowManager';
import {
  debug
} from '@/global';

class TaskSchedulerService extends BaseService {
  /**
   * @property
   * @type {TaskSchedulerService}
   */
  static instance;

  /**
   * @property
   * @type {string}
   */
  static channel = 'task-scheduler-service';

  constructor() {
    super();

    this.taskScheduler = TaskScheduler.getDefault();

    /**
     * Bind events
     */
    this.taskScheduler.on(
      'schedule_deleted',
      schedule => this.emit(this.responseChannel('schedule-deleted'), schedule.id)
    );

    this.taskScheduler.on(
      'schedule_updated',
      schedule => this.emit(this.responseChannel('schedule-updated'), schedule.toJson())
    );

    ipcMain.on(TaskSchedulerService.channel, this.channelIncomeHandler.bind(this));
  }

  /**
   * @returns {TaskSchedulerService}
   */
  static getService() {
    if (!TaskSchedulerService.instance) {
      TaskSchedulerService.instance = new TaskSchedulerService();
    }

    return TaskSchedulerService.instance;
  }

  /**
   * Get renderer response channel
   * @param {string} name
   */
  responseChannel(name) {
    return TaskSchedulerService.channel + `:${name}`;
  }

  createScheduleAction() {
    //
  }

  deleteScheduleAction() {
    //
  }

  startScheduleAction() {
    //
  }

  stopScheduleAction() {
    //
  }
}

export default TaskSchedulerService;
