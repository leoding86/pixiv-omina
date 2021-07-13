/**
 * @class
 */
class ScheduleTaskNotFoundError extends Error {
  /**
   * @constructor
   */
  constructor() {
    super('_schedule_task_not_found');

    this.name = 'ScheduleTaskNotFoundError';
  }
}

export default ScheduleTaskNotFoundError;
