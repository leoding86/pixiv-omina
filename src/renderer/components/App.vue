<template>
  <div>
    <button @click="openLogin">Login</button>
    <div>
      <input type="text" v-model="url" />
      <button @click="download">download</button>
    </div>
    <div>
      <img :src="url" alt="">
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  data() {
    return {
      url: 'https://i.pximg.net/img-master/img/2019/10/17/00/05/23/77329542_p0_master1200.jpg'
    }
  },

  mounted() {
    console.log("app");
  },

  methods: {
    openLogin() {
      ipcRenderer.send("user:login");
    },

    download() {
      ipcRenderer.send("work:download", {
        url: this.url
      });
    }
  }
};
</script>
