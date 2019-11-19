import Vue from 'vue';
import App from './components/Login';

class LoginEntry {
  constructor() {
    this.app = new Vue({
      el: '#app',
      render: h => h(App)
    });
  }
}

export default LoginEntry;
