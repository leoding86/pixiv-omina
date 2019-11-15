import { ipcMain } from 'electron'
import UserLogin from './listeners/UserLogin'

function ListenerRegister() {
  /**
   * User login event
   */
  this.listenEvent(UserLogin.event, new UserLogin())
}

ListenerRegister.prototype = {
  listenEvent(event, listener) {
    ipcMain.on(event, () => {
      listener.handle();
    });
  }
}

export default ListenerRegister;
