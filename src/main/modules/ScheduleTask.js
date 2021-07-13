import Exposer from "@/modules/Exposer";

/**
 * @class
 */
class ScheduleTask {
  /**
   * @returns {Promise<void,Error>}
   */
  start() {
    throw new Error('Method start has not been implemented');
  }

  /**
   * @returns {Promise<void,Error>}
   */
  stop() {
    throw new Error('Method stop has not been implemented');
  }
}

Exposer.expose('omina.ScheduleTask', ScheduleTask);

export default ScheduleTask;
