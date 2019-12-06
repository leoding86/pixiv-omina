<template>
  <div id="login-window">
    <div class="notification">
      <p><a href="javascript:void(0)" @click="closeWindow">Close this window after you logined</a></p>
    </div>
    <div class="webview">
      <webview src="https://accounts.pixiv.net/login"
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
