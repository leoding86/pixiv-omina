import { Notification } from 'electron';

/**
 * @typedef NotificationOptions
 * @property {String} options.title
 * @property {String=} options.subtitle macOS
 * @property {String} options.body
 * @property {Boolean=} options.silent
 * @property {String|Electron.NativeImage=} options.icon
 * @property {Boolean=} options.hasReply macOS
 * @property {String=} options.replyPlaceholder macOS
 * @property {String=} options.sound macOS
 * @property {String=} options.closeButtonText macOS
 */

/**
 * @class
 */
class NotificationManager {
  /**
   * @type {NotificationManager}
   */
  static instance = null;

  /**
   * @constructor
   */
  constructor() {
    /**
     * @type {boolean}
     */
    this.disabled = false;

    /**
     * @type {number}
     */
    this.limit = 3;

    /**
     * @type {number}
     */
    this.sendInterval = 2000;

    /**
     * @type {number}
     */
    this.latestNotifyTime = 0;

    /**
     * @type {number}
     */
    this.silentTime = 5000;

    /**
     * @type {number}
     */
    this.silentToTime = 0;

    /**
     * @type {Notification[]}
     */
    this.notifications = [];
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

  /**
   * @returns {this}
   */
  disableNotification() {
    this.disabled = true;
    return this;
  }

  /**
   * @returns {this}
   */
  enableNotification() {
    this.disabled = false;
    return this;
  }

  /**
   * @param {NotificationOptions} options
   */
  queueNotification(options) {
    this.notifications.push(this.createNotification(options));
    this.showNotification();
  }

  /**
   *
   * @param {Electron.Notification} notification
   */
  closeNotification(notification) {
    notification.close();
  }

  /**
   * @param {NotificationOptions} options
   * @returns {Notification}
   */
  createNotification(options) {
    let defaultOptions = {
      title: 'Pixiv Omina',
      silent: false,
      hasReply: false,
      replyPlaceholder: false,
      sound: true
    };

    options = Object.assign(defaultOptions, options);

    return new Notification(options);
  }

  /**
   * @returns {void}
   */
  clearNotifications() {
    this.notifications = [];
  }

  /**
   * @returns {void}
   */
  showNotification() {
    let nowTime = Date.now();

    /**
     * Check if the notification should be quite
     */
    if (nowTime < this.silentToTime) {
      return;
    }

    if (this.disabled) {
      this.clearNotifications();
    } else {
      /**
       * Check if it can send mesasge now
       */
      if ((nowTime - this.latestNotifyTime) >= this.sendInterval) {
        let notification;

        if (this.notifications.length > this.limit) {
          notification = this.createNotification(this.notifications.length + ' notifications');
          this.clearNotifications();
          this.silentToTime = nowTime + this.silentTime;
        } else {
          notification = this.notifications.shift();
        }

        this.latestNotifyTime = nowTime;
        notification.show();
      }
    }
  }
}

export default NotificationManager;
