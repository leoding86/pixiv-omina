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
      // workId: '77626643', // ugoira
      workId: '77861222', // manga
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
    ipcRenderer.on('download-service:add', (event, download) => {
      console.log(download);
    });

    ipcRenderer.on('download-service:delete', (event, downloadId) => {
      console.log(downloadId);
    });

    ipcRenderer.on('download-service:update', (event, download) => {
      console.log(download);
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
