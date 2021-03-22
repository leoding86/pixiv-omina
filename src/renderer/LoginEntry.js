import './styles/app.scss';
import Vue from 'vue';
import App from './components/Login';

class LoginEntry {
  constructor({ loginUrl = null }) {
    this.app = new Vue({
      el: '#app',
      data() {
        return {
          loginUrl
        }
      },
      render: h => h(App)
    });
  }
}

export default LoginEntry;
