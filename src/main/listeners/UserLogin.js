import WindowManager from '@/modules/WindowManager';

function UserLogin() {
  this.windowManager = WindowManager.getManager();
}

UserLogin.event = 'user:login'

UserLogin.prototype = {
  handle() {
    this.windowManager.createWindow('login', {
      parent: this.windowManager.getWindow('app'),
      modal: true,
      webPreferences: {
        nodeIntegration: true,
        webviewTag: true
      }
    });
  }
}

export default UserLogin
