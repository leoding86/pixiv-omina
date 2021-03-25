<template>
  <div id="app"
    v-loading="!inited"
    :element-loading-text="$t('_initializing')">

    <div id="header">
      <app-header>
        <el-button-group class="header__download-filter">
          <el-tooltip
            placement="bottom"
            :content="$t('_all')"
          >
            <el-button
              :type="filter === 'all' ? 'primary' : 'default'"
              size="small"
              icon="el-icon-files"
              @click="filterDownloads('all')"
            ></el-button>
          </el-tooltip>
          <el-tooltip
            placement="bottom"
            :content="$t('_downloading')"
          >
            <el-button
              :type="filter === 'downloading' ? 'primary' : 'default'"
              size="small"
              icon="el-icon-download"
              @click="filterDownloads('downloading')"
            ></el-button>
          </el-tooltip>
          <el-tooltip
            placement="bottom"
            :content="$t('_paused')"
          >
            <el-button
              :type="filter === 'paused' ? 'primary' : 'default'"
              size="small"
              icon="el-icon-video-pause"
              @click="filterDownloads('stop')"
            ></el-button>
          </el-tooltip>
          <el-tooltip
            placement="bottom"
            :content="$t('_finished')"
          >
            <el-button
              :type="filter === 'finished' ? 'primary' : 'default'"
              size="small"
              icon="el-icon-finished"
              @click="filterDownloads('finished')"
            ></el-button>
          </el-tooltip>
        </el-button-group>

        <el-button-group
          v-if="hasSelectedDownload"
          class="header__download-filter"
        >
          <el-button
            size="small"
            icon="el-icon-video-play"
            @click="batchStartDownloads"
          ></el-button>
          <el-button
            size="small"
            icon="el-icon-video-pause"
            @click="batchStopDownloads"
          ></el-button>
          <el-button
            size="small"
            icon="el-icon-delete"
            @click="batchDeleteDownloads"
          ></el-button>
        </el-button-group>
      </app-header>
    </div>

    <div id="container">
      <div class="download-list__empty-notice"
        v-if="downloads.length < 1"
      >
        {{ $t('_there_is_no_download') }}
      </div>
      <app-download-list
        class="app-download-list"
        v-else
        :downloads=filteredDownloads
        @start="startDownloadHandler"
        @stop="stopDownloadHandler"
        @delete="deleteDownloadHandler"
        @redownload="redownloadHandler"
        @clickDownload="downloadClickHandler"
      ></app-download-list>
    </div>

    <div id="footer">
      <app-footer
        :jobs-count="jobsCount"
        @devToolsToggled="devToolsToggledHandler"
        @tasksToggled="tasksToggledHandler"
      ></app-footer>
    </div>

    <app-task-list
      v-if="showTasks"
      :tasks="tasks"
      @pauseTask="pauseTaskHandler"
      @startTask="startTaskHandler"
    ></app-task-list>

    <app-restore-downloads-dialog :show.sync="showRestoreDownloadsDialog"></app-restore-downloads-dialog>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import Header from './Header';
import Footer from './Footer';
import DownloadList from './DownloadList';
import TaskList from './TaskList';
import RestoreDownloadsDialog from './dialogs/RestoreDownloadsDialog';

export default {
  components: {
    'app-header': Header,
    'app-footer': Footer,
    'app-download-list': DownloadList,
    'app-task-list': TaskList,
    'app-restore-downloads-dialog': RestoreDownloadsDialog
  },

  data() {
    return {
      downloads: [],
      downloadFilter: 'all',
      hasSelectedDownload: false,
      debug: false,
      showTasks: false,
      tasks: [],
      showRestoreDownloadsDialog: false,
      networkCannotReach: false
    }
  },

  computed: {
    loginError() {
      switch (this.$root.appLoginError) {
        case 'InvalidResponseError':
        case 'InvalidResponseError':
        case 'ResponseError':
          return this.$t('_try_again');
        case 'RequestError':
          return this.$t('_network_error');
        default:
          return;
      }
    },

    filter() {
      return this.downloadFilter;
    },

    filteredDownloads() {
      let downloads = [];

      this.downloads.forEach(download => {
        if (this.filter !== 'all') {
          if (this.filter === 'finished' && download.state === 'finish') {
            downloads.push(download);
          } else if (this.filter === 'downloading' && (download.state === 'downloading' || download.state === 'pending' || download.state === 'processing')) {
            downloads.push(download);
          } else if (this.filter === 'stop' && download.state === 'stop') {
            downloads.push(download);
          }
        } else {
          downloads.push(download);
        }
      });

      return downloads;
    },

    jobsCount() {
      let count = 0;

      this.tasks.forEach(task => {
        count += task.jobsLeft;
      });

      return count;
    }
  },

  watch: {
    downloadFilter() {
      this.clearSelections();
    },

    inited(value, oldValue) {
      if (oldValue === false && value === true) {
        ipcRenderer.send('download-service', {
          action: 'fetchAllDownloads'
        });
      }
    },

    logined(value) {
      if (!!value && !!this.settings.autostartDownload) {
        ipcRenderer.send('download-service', {
          action: 'startDownload',
          args: {
            downloadId: null
          }
        });
      }
    }
  },

  beforeMount() {
    this.downloadsList = {};

    this.selectedDownloads = {};

    this.firstSelectedDownload = null;

    document.body.addEventListener('click', () => {
      this.clearSelections();
      this.firstSelectedDownload = null;
    });

    ipcRenderer.on('download-service:add', (event, download) => {
      this.addDownloads(download);
    });

    ipcRenderer.on('download-service:add-batch', (event, downloads) => {
      this.addDownloads(downloads);
    });

    ipcRenderer.on('download-service:stop', (event, download) => {
      this.updateDownloads(download);
    });

    ipcRenderer.on('download-service:stop-batch', (event, downloadIds) => {
      downloadIds.forEach(downloadId => {
        this.updateDownloads({
          id: downloadId,
          state: 'stop',
          statusMessage: 'stop'
        });
      })
    });

    ipcRenderer.on('download-service:delete', (event, downloadId) => {
      this.deleteDownload(downloadId);
    });

    ipcRenderer.on('download-service:delete-batch', (event, downloadIds) => {
      downloadIds.forEach(downloadId => {
        this.deleteDownload(downloadId);
      });
    });

    ipcRenderer.on('download-service:update', (event, download) => {
      this.updateDownloads(download);
    });

    ipcRenderer.on('download-service:duplicated', (event, downloadId) => {
      alert(this.$t('_download_is_already_exists_delete_it_and_try_again'));
    });

    ipcRenderer.on('download-service:error', (event, downloadId) => {
      alert(this.$t('_this_is_not_a_valid_url'));
    });

    ipcRenderer.on('download-service:downloads', (event, downloads) => {
      this.addDownloads(downloads);
    });

    ipcRenderer.on('download-service:restore', (event) => {
      // Try to start restored downloads
      if (this.logined && !!this.settings.autostartDownload) {
        ipcRenderer.send('download-service', {
          action: 'startDownload',
          args: {
            downloadId: null
          }
        });
      }
    });

    ipcRenderer.on('download-service:cached-downloads-result', (event, result) => {
      if (result) {
        this.showRestoreDownloadsDialog = true;
      }
    });

    ipcRenderer.on('task-service:paused', (event, task) => {
      this.updateTask(task);
    });

    ipcRenderer.on('task-service:progress', (event, task) => {
      this.updateTask(task);
    });

    ipcRenderer.send('download-service', {
      action: 'hasCachedDownloads'
    });
  },

  mounted() {
    document.addEventListener('keydown', this.keydownHandler);
  },

  beforeDestroy() {
    document.removeEventListener('keydown', this.keydownHandler);
  },

  methods: {
    devToolsToggledHandler(val) {
      this.debug = val;
    },

    tasksToggledHandler(val) {
      this.showTasks = val;
    },

    canStartDownload(download) {
      return ['stop', 'error'].indexOf(download.state) > -1;
    },

    canStopDownload(download) {
      return ['pending', 'downloading', 'processing'].indexOf(download.state) > -1;
    },

    canDeleteDownload(download) {
      return 'processing' !== download.state;
    },

    findDownload(download) {
      let downloadId;

      if (typeof download === 'object') {
        downloadId = download.id;
      } else {
        downloadId = download;
      }

      if (this.downloadsList[downloadId]) {
        return this.downloadsList[downloadId];
      }

      return null;
    },

    appendDownload(download) {
      if (!this.findDownload(download)) {
        /**
         * Add reactive properties before push the download to downloads stack
         */
        download.selected = false;
        download.frozing = false;
        this.downloads.push(download);
        this.downloadsList[download.id] = this.downloads[this.downloads.length - 1];
      }
    },


    /**
     * Reactive add from the main process
     */
    addDownloads(downloads) {
      if (!Array.isArray(downloads)) {
        downloads = [downloads];
      }

      downloads.forEach(download => {
        if (!this.findDownload(download)) {
          this.appendDownload(download);
        }
      });

      ipcRenderer.send('download-service', {
        action: 'startDownload',
        args: {
          downloadId: null
        }
      });
    },

    /**
     * Reactive the update from the main process
     */
    updateDownloads(download) {
      let _download = this.findDownload(download);

      if (_download) {
        let index = this.downloads.indexOf(_download);

        _download.frozing = false;

        this.$set(this.downloads, index, Object.assign(_download, download));

        this.downloadsList[download.id] = this.downloads[index];
      }
    },

    /**
     * Reactive the delete from the main process
     */
    deleteDownload(downloadId) {
      let _download = this.findDownload(downloadId);

      if (_download) {
          this.downloads.splice(this.downloads.indexOf(_download), 1);

          delete this.downloadsList[downloadId];

          return;
      }
    },

    startDownloadHandler(download) {
      if (this.downloads.length > 0) {
        ipcRenderer.send('download-service', {
          action: 'startDownload',
          args: {
            downloadId: download.id
          }
        });
      }
    },

    stopDownloadHandler(download) {
      download.frozing = true;

      this.$set(this.downloads, this.downloads.indexOf(download), download);

      ipcRenderer.send('download-service', {
        action: 'stopDownload',
        args: {
          downloadId: download.id
        }
      });
    },

    /**
     * delete the download
     */
    deleteDownloadHandler(download) {
      download.frozing = true;

      this.$set(this.downloads, this.downloads.indexOf(download), download);

      ipcRenderer.send('download-service', {
        action: 'deleteDownload',
        args: {
          downloadId: download.id
        }
      });
    },

    /**
     * redownload, useless for this moment
     */
    redownloadHandler(download) {
      ipcRenderer.send('download-service', {
        action: 'redownload',
        args: {
          downloadId: download.id
        }
      });
    },

    batchStartDownloads() {
      let downloadIds = [];

      for (let id in this.selectedDownloads) {
        if (this.canStartDownload(this.selectedDownloads[id])) {
          downloadIds.push(id);
        }
      }

      ipcRenderer.send('download-service', {
        action: 'batchStartDownloads',
        args: {
          downloadIds: downloadIds
        }
      });
    },

    batchStopDownloads() {
      let downloadIds = [];

      for (let id in this.selectedDownloads) {
        if (this.canStopDownload(this.selectedDownloads[id])) {
          downloadIds.push(id);
        }
      }

      ipcRenderer.send('download-service', {
        action: 'batchStopDownloads',
        args: {
          downloadIds: downloadIds
        }
      });
    },

    batchDeleteDownloads() {
      let downloadIds = [];

      for (let id in this.selectedDownloads) {
        if (this.canDeleteDownload(this.selectedDownloads[id])) {
          downloadIds.push(id);
        }
      }

      ipcRenderer.send('download-service', {
        action: 'batchDeleteDownloads',
        args: {
          downloadIds: downloadIds
        }
      });
    },

    downloadClickHandler({ download, event }) {
      console.log(event);

      if (this.isCtrlKeyHeld(event)) {
        this.selectDownload(download);
      } else if (this.isShiftKeyHeld(event)) {
        this.clearSelections();

        this.selectDownload(download);

        if (this.firstSelectedDownload) {
          let startIndex = this.downloads.indexOf(this.firstSelectedDownload);
          let endIndex = this.downloads.indexOf(download);
          let s = null, e = null;

          if (startIndex !== endIndex) {
            if (startIndex > endIndex) {
              s = endIndex;
              e = startIndex;
            } else if (startIndex < endIndex) {
              s = startIndex;
              e = endIndex;
            }

            while (s <= e) {
              this.selectDownload(this.downloads[s]);

              s++;
            }
          }
        }

        this.hasSelectedDownload = true;

        return;
      } else {
        this.selectDownload(download);

        /**
         * Clear selections if ctrl or command key is not held
         */
        for (let downloadId in this.selectedDownloads) {
          if (download.id !== downloadId) {
            this.removeSelectedDownload(this.selectedDownloads[downloadId]);
          }
        }
      }

      this.hasSelectedDownload = true;

      this.firstSelectedDownload = download;
    },

    clearSelections() {
      for (let downloadId in this.selectedDownloads) {
        this.removeSelectedDownload(this.selectedDownloads[downloadId]);
      }

      this.hasSelectedDownload = false;
    },

    selectDownload(download) {
      if (!download.selected) {
        download.selected = true;
        this.selectedDownloads[download.id] = download;
      }
    },

    removeSelectedDownload(download) {
      download.selected = false;
      delete this.selectedDownloads[download.id];
    },

    filterDownloads(type) {
      this.downloadFilter = type;
    },

    /**
     * @param {	KeyboardEvent} event
     */
    keydownHandler(event) {
      if (event.ctrlKey && event.keyCode === 65) {
        this.filteredDownloads.forEach(download => {
          this.selectDownload(download);
        });
      }
    },

    updateTask(task) {
      for (let i = 0; i < this.tasks.length; i++) {
        if (task.name === this.tasks[i].name) {
          this.$set(this.tasks, i, Object.assign({}, this.tasks[i], task));
          return;
        }
      }

      this.tasks.push(task);
    },

    pauseTaskHandler(name) {
      ipcRenderer.send('task-service', {
        action: 'pauseTask',
        args: {
          name
        }
      });
    },

    startTaskHandler(name) {
      ipcRenderer.send('task-service', {
        action: 'startTask',
        args: {
          name
        }
      });
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
  flex: 1;
  box-sizing: border-box;
  position: relative;
  overflow-y: auto;
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

.login-error {
  padding: 10px 0;
  font-size: 12px;
  color: gray;
}

#test {
  height: 200px;
}
</style>
