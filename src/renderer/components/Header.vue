<template>
  <div id="header">
    <el-button icon="el-icon-user"
      size="small"
    >
      <span v-if="!logined"
        @click="userLogin"
      >Login</span>
      <span v-else
        @click="userLogout"
      >Logout</span>
    </el-button>
    <el-button icon="el-icon-setting"
      size="small"
    >
      <span>Setting</span>
    </el-button>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  computed: {
    logined() {
      return this.$root.$data.logined;
    }
  },

  methods: {
    userLogin() {
      ipcRenderer.send("user-service", {
        action: 'userLogin'
      });
    },

    userLogout() {
      //
    }
  }
}
</script>

<style lang="scss">
#header {
  padding: 10px;
  background: #efefef;
}
</style>
