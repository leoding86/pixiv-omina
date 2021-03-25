import './styles/app.scss';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import App from './components/Login';
import locales from '../locales';

class LoginEntry {
  constructor({ loginUrl = null, locale = null }) {
    Vue.use(VueI18n);

    const i18n = new VueI18n({
      locale: 'en',
      messages: locales
    });

    if (locale) {
      i18n.locale = locale;
    }

    this.app = new Vue({
      i18n,

      el: '#app',

      data() {
        return {
          loginUrl,
          locale
        }
      },

      render: h => h(App)
    });
  }
}

export default LoginEntry;
