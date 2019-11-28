<template>
  <div id="app"
    v-loading="!inited"
    element-loading-text="Initializing...">

    <div id="header">
      <app-header></app-header>
    </div>

    <div id="container">
      <div id="app-container-mask"
        v-if="inited && !logined">
        <div class="app-container-mask__body">
          <el-button
            type="primary"
            @click="userLogin"
          >LOGIN PIXIV</el-button>
        </div>
      </div>

      <div class="download-list__empty-notice"
        v-if="downloads.length < 1">
        There is no download
      </div>
      <app-download-list
        class="app-download-list"
        v-else
        :downloads=downloads
        @start="startDownloadHandler"
        @stop="stopDownloadHandler"
        @delete="deleteDownloadHandler"
        @redownload="redownloadHandle"
      ></app-download-list>
    </div>

    <div id="footer">
      <app-footer></app-footer>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import Header from './Header';
import Footer from './Footer';
import DownloadList from './DownloadList';
import Test from './Test';

export default {
  components: {
    'app-header': Header,
    'app-footer': Footer,
    'app-download-list': DownloadList,
    'app-test': Test
  },

  data() {
    return {
      // workId: '77626643', // ugoira
      workId: '77897318', // manga 30pages
      downloads: []
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
      this.deleteDownload(downloadId);
    });

    ipcRenderer.on('download-service:update', (event, download) => {
      this.updateDownloads(download);
    });

    ipcRenderer.on('download-service:duplicated', (event, downloadId) => {
      alert('Download is already exists');
    });

    ipcRenderer.on('download-service:error', (event, downloadId) => {
      alert('This is not a valid url');
    });

    ipcRenderer.on('download-service:downloads', (event, downloads) => {
      this.downloads = downloads;
    });

    ipcRenderer.send('download-service', {
      action: 'fetchAllDownloads'
    });
  },

  methods: {
    updateDownloads(download) {
      console.log(download);

      let _download = this.findDownload(download);

      if (_download) {
          this.$set(this.downloads, this.downloads.indexOf(_download), download);
          return;
      }

      this.downloads.push(download);
    },

    deleteDownload(downloadId) {
      let _download = this.findDownload(downloadId);

      if (_download) {
          this.downloads.splice(this.downloads.indexOf(_download), 1);
          return;
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
    },

    startDownloadHandler(download) {
      ipcRenderer.send('download-service', {
        action: 'startDownload',
        args: {
          downloadId: download.id
        }
      });
    },

    stopDownloadHandler(download) {
      let _download = this.findDownload(download);

      if (_download) {
        _download.frozing = true;

        this.$set(this.downloads, this.downloads.indexOf(_download), _download);

        ipcRenderer.send('download-service', {
          action: 'stopDownload',
          args: {
            downloadId: _download.id
          }
        });
      }
    },

    deleteDownloadHandler(download) {
      let _download = this.findDownload(download);

      if (_download) {
        _download.frozing = true;

        this.$set(this.downloads, this.downloads.indexOf(_download), _download);

        ipcRenderer.send('download-service', {
          action: 'deleteDownload',
          args: {
            downloadId: download.id
          }
        });
      }
    },

    redownloadHandle(download) {
      ipcRenderer.send('download-service', {
        action: 'redownload',
        args: {
          downloadId: download.id
        }
      });
    },

    findDownload(download) {
      let downloadId;

      if (typeof download === 'object') {
        downloadId = download.id;
      } else {
        downloadId = download;
      }

      for (let i = 0, l = this.downloads.length; i < l; i++) {
        if (this.downloads[i].id === downloadId) {
          return this.downloads[i];
        }
      }

      return null;
    },

    userLogin() {
      if (!this.logined) {
        ipcRenderer.send("user-service", {
          action: 'userLogin'
        });
      } else {
        alert('You are logined');
      }
    }
  }
};
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

#header {
  height: 32px;
  padding: 10px;
  background: #efefef;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.15);
}

#container {
  display: flex;
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
  position: relative;
}

#footer {
  position: relative;
  height: 25px;
  padding: 0 10px;
  background: #eee;
  z-index: 999999;
}

#app-container-mask {
  display: table;
  position: absolute;
  z-index: 999;
  background: rgba(255, 255, 255, 0.7);
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.app-container-mask__body {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}

.app-download-list {
  flex: 1;
}

.download-list__empty-notice {
  text-align: center;
  font-size: 14px;
  margin: 20px 0;
  color: #dedede;
  text-shadow: 0 -1px 0 #6d6d6d;
}

#test {
  height: 200px;
}
</style>
