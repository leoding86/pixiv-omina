import 'element-ui/lib/theme-chalk/index.css';
import './styles/app.scss';

import App from './components/App';
import BaseMixin from './mixins/BaseMixin';
import ElementUI from 'element-ui';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { ipcRenderer } from 'electron';
import locales from '../locales';

Vue.use(VueI18n)
   .use(ElementUI);

const i18n = new VueI18n({
  locale: 'en',
  messages: locales
});


/**
 * Config global mixin
 */
Vue.mixin(BaseMixin);

class MainEntry {
  constructor() {
    this.app = new Vue({
      i18n,

      el: '#app',

      render: h => h(App),//

      data() {
        return {
          appLogined: false,
          appSettings: {},
          appPlatform: null,
          appLoginError: null
        }
      },

      beforeMount() {
        this.appPlatform = this.getPlatform();

        this.$on('user:logout', () => {
          this.appLogined = false;
        });

        ipcRenderer.on('setting-service:change', (event, changedSettings) => {
          if (changedSettings.locale) {
            i18n.locale = changedSettings.locale;
          }

          this.appSettings = Object.assign({}, this.appSettings, changedSettings);

          this.msg(this.$t('_settings_saved'));
        });

        ipcRenderer.on('setting-service:settings', (event, settings) => {
          this.appSettings = settings;

          i18n.locale = this.appSettings.locale;
        });

        ipcRenderer.on('user-service:check-login', (event, logined, error) => {
          this.appLogined = logined;
          this.appLoginError = error;
        });

        ipcRenderer.send('setting-service', {
          action: 'getSettings'
        });

        // Check new version
        ipcRenderer.send('update-service', {
          action: 'checkUpdate'
        });

        this.checkUserLogin();
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
          ipcRenderer.send('user-service', {
            action: 'checkUserLogin'
          });
        }
      }
    });
  }
}

export default MainEntry;
