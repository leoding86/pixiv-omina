<template>
  <div>
    <app-header></app-header>

    <div id="container">
      <button @click="checkUserLogined">check</button>

      <el-form>
        <el-input v-model="workId"></el-input>
        <el-button @click="createDownloader">Submit</el-button>
      </el-form>

      <app-download-list
        :downloads=downloads
      ></app-download-list>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import Header from './Header';
import DownloadList from './DownloadList';

export default {
  components: {
    'app-header': Header,
    'app-download-list': DownloadList
  },

  data() {
    return {
      workId: '77626643',
      downloads: []
    }
  },

  computed: {
    logined() {
      return this.$root.$data.logined;
    }
  },

  mounted() {
    console.log("app");
  },

  beforeMount() {
    ipcRenderer.on('download-service:add', ({ workDownload }) => {
      //
    });

    ipcRenderer.on('download-service:delete', ({ workDownload }) => {
      //
    });

    ipcRenderer.on('download-service:update', ({ workDownload }) => {
      //
    });

    ipcRenderer.on('download-service:stop', ({ workDownload }) => {
      //
    });

    ipcRenderer.on('download-service:error', ({ workDownloader }) => {
      //
    });
  },

  methods: {
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
};
</script>
