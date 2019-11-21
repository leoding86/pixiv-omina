<template>
  <div>
    <app-header></app-header>

    <div id="container">
      <button @click="checkUserLogined">check</button>

      <el-form>
        <el-input v-model="workId"></el-input>
        <el-button @click="createDownloader">Submit</el-button>
      </el-form>

      <div v-if="downloads.length < 1">
        There is no download, add one.
      </div>
      <app-download-list
        v-else
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
      workId: '77897318', // manga 30pages
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
      this.updateDownloads(download);
    });

    ipcRenderer.on('download-service:delete', (event, downloadId) => {
      this.deleteDownload(download);
    });

    ipcRenderer.on('download-service:update', (event, download) => {
      this.updateDownloads(download);
    });
  },

  methods: {
    updateDownloads(download) {console.log(download);
      for (let i = 0, l = this.downloads.length; i < l; i++) {
        if (this.downloads[i].id === download.id) {
          this.$set(this.downloads, i, Object.assign({}, download));

          return;
        }
      }

      this.downloads.push(download);
    },

    deleteDownload(downloadId) {
      for (let i = 0, l = this.downloads.length; i < l; i++) {
        if (this.downloads[i].id === download.id) {
          this.downloads = this.downloads.splice(i, 1);

          return;
        }
      }
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
};
</script>
