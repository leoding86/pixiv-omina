<template>
  <el-card id="test">
    <div slot="header">
      Tests
    </div>

    <button @click="testUserLogout">Logout</button>

    <button @click="checkUserLogined">check</button>

    <el-form>
      <el-input v-model="workId"></el-input>
      <el-button @click="createDownloader">Submit</el-button>
    </el-form>
  </el-card>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  data() {
    return {
      workId: 77897318
    }
  },

  methods: {
    testUserLogout() {
      ipcRenderer.send("user-service", {
        action: 'userLogout'
      });
    },

    checkUserLogined() {
      ipcRenderer.send('user-service', {
        action: 'checkUserLogined'
      });
    },

    createDownloader() {
      ipcRenderer.send('download-service', {
        action: 'createDownload',
        args: {
          workId: this.workId
        }
      })
    }
  }
}
</script>
