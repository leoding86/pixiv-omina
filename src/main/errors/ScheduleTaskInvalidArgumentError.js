/**
 * @class
 */
 class ScheduleTaskInvalidArgumentError extends Error {
  /**
   * @constructor
   * @param {string} message
   */
  constructor(message) {
    super(message ? message : '_schedule_task_invalid_argument');

    this.name = 'ScheduleTaskInvalidArgumentError';
  }
}

export default ScheduleTaskInvalidArgumentError;
