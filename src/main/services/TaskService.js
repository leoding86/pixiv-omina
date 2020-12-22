import {
  app,
  ipcMain
} from 'electron';

import BaseService from '@/services/BaseService';
import TaskManager from '@/modules/TaskManager';
import BaseTask from '@/modules/Task/BaseTask';
import WindowManager from '@/modules/WindowManager';

class TaskService extends BaseService {
  /**
   * @property
   * @type {TaskService}
   */
  static instance;

  /**
   * @property
   * @type {string}
   */
  static channel = 'task-service';

  constructor() {
    super();

    this.mainWindow = WindowManager.getWindow('app');

    this.taskManager = TaskManager.getDefault();

    this.taskManager.on('progress', this.taskManagerProgressListener.bind(this));
    this.taskManager.on('paused', this.taskManagerPausedListener.bind(this));

    ipcMain.on(TaskService.channel, this.channelIncomeHandler.bind(this));
  }

  /**
   * @returns {TaskService}
   */
  static getService() {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }

    return TaskService.instance;
  }

  /**
   * Get renderer response channel
   * @param {string} name
   */
  responseChannel(name) {
    return TaskService.channel + `:${name}`;
  }

  /**
   * Handling task manager pasued event
   * @param {BaseTask} task Relative task instance
   */
  taskManagerPausedListener(task) {
    this.mainWindow.webContents.send(this.responseChannel('paused'), {
      name: task.getName(),
      status: task.getStatus()
    });
  }

  /**
   * Handling task manager progress event
   * @param {BaseTask} task Relative task instance
   */
  taskManagerProgressListener(task) {
    this.mainWindow.webContents.send(this.responseChannel('progress'), {
      name: task.getName(),
      status: task.getStatus(),
      progress: task.getProgress()
    });
  }

  /**
   * Restore unfinished tasks
   */
  restoreTasks() {
    //
  }

  /**
   * Add payload to task
   * @param {Object} param
   * @param {String} param.name
   * @param {Object} param.args
   */
  addTaskAction({ name, args }) {
    this.taskManager.addTaskPayload(name, args);
    this.taskManager.startTask(name);
  }

  /**
   * Pause task
   * @param {Object} param
   * @param {String} param.name
   */
  pauseTaskAction({ name }) {
    this.taskManager.pauseTask(name);
  }
}

export default TaskService;
