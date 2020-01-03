import { app } from 'electron';
import AppEventListenerMap from './AppEventListenerMap';
import Application from './Application';

class Bootstrap {
  static instance;

  constructor() {
    this.bindAppEvents(new Application());
  }

  static boot() {
    if (!Bootstrap.instance) {
      Bootstrap.instance = new Bootstrap();
    }
  }

  bindAppEvents(bootableObj) {
    for (let event in AppEventListenerMap) {
      if (typeof bootableObj[AppEventListenerMap[event]] === 'function') {
        app.on(event, bootableObj[AppEventListenerMap[event]].bind(bootableObj));
      }
    }
  }
}

export default Bootstrap;
