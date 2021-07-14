import { ipcMain } from 'electron';
import BaseService from './BaseService';
import TaskScheduler from '@/modules/TaskScheduler';
import WindowManager from '@/modules/WindowManager';
import {
  debug
} from '@/global';
import Schedule from '@/modules/Schedule';

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
     * Bind events on TaskScheduler
     */
    this.taskScheduler.on(
      'schedule_updated',
      schedule => {
        this.sendDataToWindow(this.responseChannel('schedule-updated'), schedule.toJson());
      }
    );

    /**
     * Bind events on ScheduleTaskPool
     */
    this.taskScheduler.taskPool.on(
      'added',
      data => {
        this.sendDataToWindow(this.responseChannel('schedule-task-added'), data);
      }
    );

    this.taskScheduler.taskPool.on(
      'deleted',
      key => {
        this.sendDataToWindow(this.responseChannel('schedule-task-deleted'), key);
      }
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

  /**
   * @returns {void}
   */
  getAllTasksAction() {
    let tasks = [];

    this.taskScheduler.taskPool.getTasks().forEach(task => {
      tasks.push({
        key: task.key,
        name: task.name,
        argumentsConfig: task.argumentsConfig
      });
    });

    this.sendDataToWindow(
      this.responseChannel('all-tasks-gotten'),
      tasks
    );
  }

  /**
   * @returns {void}
   */
  getAllSchedulesAction() {
    let schedules = this.taskScheduler.getAllSchedules(),
        data = [];

    schedules.forEach(schedule => {
      data.push(schedule.toJson());
    });

    this.sendDataToWindow(
      this.responseChannel('all-schedules-gotten'),
      data
    );
  }

  createScheduleAction(args, event) {
    let schedule = Schedule.createSchedule(args);

    this.taskScheduler.addSchedule(schedule);

    this.sendDataToWindow(
      this.responseChannel('schedule-added'),
      schedule.toJson()
    );
  }

  deleteScheduleAction({ id }, event) {
    this.taskScheduler.deleteSchedule(id);

    this.sendDataToWindow(
      this.responseChannel('schedule-deleted'),
      { id }
    );
  }

  startScheduleAction({ id }, event) {
    this.taskScheduler.startSchedule(id);
  }

  stopScheduleAction({ id }, event) {
    this.taskScheduler.stopSchedule(id);
  }
}

export default TaskSchedulerService;
