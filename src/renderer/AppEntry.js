import { ipcRenderer } from 'electron';
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './styles/app.scss';
import App from './components/App';
import BaseMixin from './mixins/BaseMixin';

Vue.use(ElementUI);

/**
 * Config global mixin
 */
Vue.mixin(BaseMixin);

class MainEntry {
  constructor() {
    this.app = new Vue({
      el: '#app',

      render: h => h(App),

      data() {
        return {
          appInited: false,
          appLogined: false
        }
      },

      beforeMount() {
        ipcRenderer.on('user-service:check-login', () => {
          ipcRenderer.send('user-service', {
            action: 'checkUserLogined'
          });
        });

        ipcRenderer.on('user-service:logined', () => {
          this.appInited = true;
          this.appLogined = true;
        });

        ipcRenderer.on('user-service:not-login', () => {
          this.appInited = true;
          this.appLogined = false;
        });

        ipcRenderer.send('user-service', {
          action: 'checkUserLogined'
        });
      }
    });
  }
}

export default MainEntry;
