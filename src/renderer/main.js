'use strict';

import Vue from 'vue';
// import App from './components/App'
// import Login from './components/Login'

const url = window.location.href;

const matches = url.match(/target=(.+)$/)

let name;

if (matches[1]) {
  name = matches[1].slice(0, 1).toUpperCase() + matches[1].slice(1);
}

import(`./components/${name}`).then(({ default: App}) => {
  window.app = new Vue({
      el: '#app',
      render: h => h(App)
  });
})
