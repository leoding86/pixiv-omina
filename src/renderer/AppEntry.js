import { ipcRenderer } from 'electron';
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './components/App';

Vue.use(ElementUI);

class MainEntry {
  constructor() {
    this.app = new Vue({
      el: '#app',

      render: h => h(App),

      data() {
        return {
          logined: false
        }
      },

      beforeMount() {
        ipcRenderer.on('user-service:check-login', () => {
          ipcRenderer.send('user-service', {
            action: 'checkUserLogined'
          });
        });

        ipcRenderer.on('user-service:logined', () => {
          this.logined = true;
        });

        ipcRenderer.on('user-service:not-login', () => {
          this.logined = false;
        });

        ipcRenderer.send('user-service', {
          action: 'checkUserLogined'
        });
      }
    });
  }
}

export default MainEntry;
