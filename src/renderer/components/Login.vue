<template>
  <div id="login-window">
    <div class="notification">
      <p>Close this window after you logined</p>
    </div>
    <div class="webview">
      <webview src="https://accounts.pixiv.net/login">
        Loading login page
      </webview>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>

<style lang="scss">
html, body {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
}

div, webview, p {
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

  webview {
    position: absolute;
    width: 100%;
    height: 100%;
  }
}
</style>
