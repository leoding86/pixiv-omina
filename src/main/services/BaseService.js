import WindowManager from '@/modules/WindowManager';

class BaseService {
  /**
   * @static
   * @type {string}
   */
  static channel = 'base';

  /**
   * @param {string} event
   * @param {Object} args
   */
  channelIncomeHandler(event, args) {
    this.callAction(args.action, args.args, event);
  }

  /**
   * @param {string} event
   * @param {Object} args
   */
  callAction(action, args, event) {
    let method;

    if (typeof action === 'string' && action.length > 0) {
      method = `${action}Action`;
    }

    if (typeof this[method] === 'function') {
      this[method].call(this, args, event);
      return;
    }

    Error(`Invalid action method '${method}'`);
  }

  sendDataToWindow(channel, data) {
    WindowManager.getWindow('app').webContents.send(channel, data);
  }

  /**
   * Get renderer response channel
   * @param {string} name
   */
  responseChannel(name) {
    return BaseService.channel + `:${name}`;
  }
}

export default BaseService;
