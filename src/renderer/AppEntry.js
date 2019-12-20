import { ipcRenderer } from 'electron';
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './styles/app.scss';
import App from './components/App';
import BaseMixin from './mixins/BaseMixin';
import User from './modules/User';

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
          appLogined: false,
          appSettings: {},
          appPlatform: null
        }
      },

      beforeMount() {
        this.appPlatform = this.getPlatform();

        this.$on('user:logout', () => {
          this.appLogined = false;
        });

        ipcRenderer.on('setting-service:change', (event, changedSettings) => {
          this.$message('Setting saved');

          this.appSettings = Object.assign({}, this.appSettings, changedSettings);
        });

        ipcRenderer.on('setting-service:settings', (event, settings) => {
          this.appSettings = settings;

          this.checkUserLogin();
        });

        ipcRenderer.on('user-service:check-login', () => {
          this.checkUserLogin();
        });

        ipcRenderer.send('setting-service', {
          action: 'getSettings'
        });
      },

      methods: {
        getPlatform() {
          switch (process.platform) {
            case 'win32':
              return 'windows';
            case 'darwin':
              return 'macos';
            case 'linux':
              return 'linux';
            default:
              return process.platform;
          }
        },

        checkUserLogin() {
          User.checkLogin().then(() => {
            this.appInited = this.appLogined = true;
          }).catch(() => {
            this.appInited = !(this.appLogined = false);
          });
        }
      }
    });
  }
}

export default MainEntry;
