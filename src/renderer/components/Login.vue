<template>
  <div id="login-window">
    <div class="notification">
      <p><a href="javascript:void(0)" @click="closeWindow">{{ $t('_close_this_window_after_you_logined') }}</a></p>
    </div>
    <div class="webview">
      <webview :src="loginUrl"
        partition="persist:main"
      >
        Loading login page
      </webview>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  computed: {
    loginUrl() {
      return !this.$root.loginUrl
             ? 'https://accounts.pixiv.net/login'
             : this.$root.loginUrl;
    }
  },

  methods: {
    closeWindow() {
      ipcRenderer.send('user-service', {
        action: 'closeLogin'
      });
    }
  }
}
</script>

<style lang="scss">
html, body {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
}

div, webview, iframe, p {
  margin: 0;
  padding: 0;
}

#login-window {
  width: 100%;
  height: 100%;

  a {
    color: #fff;
    text-decoration: none;
  }
}

.notification {
  width: 100%;
  height: 30px;
  background: rgb(0, 98, 255);
  color: #fff;

  p {
    line-height: 30px;
    text-align: center;
  }
}

.webview {
  width: 100%;
  height: calc(100% - 30px);
  position: relative;

  webview, iframe {
    position: absolute;
    width: 100%;
    height: 100%;
    border: none;
  }
}
</style>
