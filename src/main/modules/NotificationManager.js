import { Notification } from 'electron';

class NotificationManager {
  static instance = null;

  constructor() {
    this.disabled = false;
    this.completedDownloadCount = 0;
    this.failedDownloadCount = 0;
  }

  /**
   * @returns {NotificationManager}
   */
  static getDefault() {
    if (!Notification.instance) {
      Notification.instance = new NotificationManager();
    }

    return Notification.instance;
  }

  disableNotification() {
    this.disabled = true;
  }

  enableNotification() {
    this.disabled = false;
  }

  /**
   *
   * @param {Electron.Notification} notification
   */
  closeNotification(notification) {
    notification.close();
  }

  /**
   *
   * @param {Object} options
   * @param {String} options.title
   * @param {String=} options.subtitle macOS
   * @param {String} options.body
   * @param {Boolean=} options.silent
   * @param {String|Electron.NativeImage=} options.icon
   * @param {Boolean=} options.hasReply macOS
   * @param {String=} options.replyPlaceholder macOS
   * @param {String=} options.sound macOS
   * @param {String=} options.closeButtonText macOS
   */
  showNotification(options) {
    let defaultOptions = {
      title: 'Pixiv Omina',
      silent: false,
      hasReply: false,
      replyPlaceholder: false,
      sound: true
    };

    options = Object.assign(defaultOptions, options);

    const notification = new Notification(options);

    if (!this.disabled) notification.show();

    return notification;
  }

  /**
   *
   * @param {Object} options
   * @param {String} options.title Work title
   */
  showDownloadAddedNotification(options) {
    return this.showNotification({
      body: options.title
    });
  }
}

export default NotificationManager;
