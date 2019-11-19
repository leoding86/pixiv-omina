class BaseService {
  /**
   * @param {string} event
   * @param {Object} args
   */
  channelIncomeHandler(event, args) {
    this.callAction(args.action, args.args);
  }

  /**
   * @param {string} event
   * @param {Object} args
   */
  callAction(action, args) {
    let method;

    if (typeof action === 'string' && action.length > 0) {
      method = `${action}Action`;
    }

    if (typeof this[method] === 'function') {
      this[method].call(this, args);
      return;
    }

    Error(`Invalid action method '${method}'`);
  }
}

export default BaseService;
