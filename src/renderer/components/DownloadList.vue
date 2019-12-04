<template>
  <div class="download-list">
    <div class="download-list-item__content">
      <el-card class="download-list-item"
        v-for="download in filteredDownloads"
        :key=download.id
      >
        <div class="download-list-item__mask"
          v-if="download.frozing"></div>
        <div class="download-list-item__body">
          <div class="download-list-item__title-actions">
            <div class="download-list-item__title">
              <h3>
                <span :class="getDownloadTypeClassname(download.type)">{{ getDownloadType(download.type) }}</span>
                <a target="_blank" :href="`https://www.pixiv.net/artworks/${download.id}`">{{ download.title }} <i class="el-icon-link"></i></a>
              </h3>
            </div>
            <div class="download-list-item__actions">
              <el-button-group>
                <el-button
                  v-if="download.state === 'stop' || download.state === 'error'"
                  type="primary"
                  size="mini"
                  icon="el-icon-video-play"
                  @click="$emit('start', download)"
                ></el-button>
                <el-button
                  v-if="download.state === 'pending' || download.state === 'downloading'"
                  type="primary"
                  size="mini"
                  icon="el-icon-video-pause"
                  :disabled="download.state === 'processing'"
                  @click="clickStopHandler(download)"
                ></el-button>
                <el-button
                  v-if="download.state === 'finish'"
                  type="primary"
                  size="mini"
                  icon="el-icon-folder"
                  @click="openFolder(download)"
                ></el-button>
                <!-- Hidden redownload button -->
                <el-button
                  v-if="false && download.state === 'finish'"
                  type="primary"
                  size="mini"
                  icon="el-icon-refresh"
                  @click="download.state === 'finish' && $emit('redownload', download)"
                ></el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  :disabled="download.state === 'processing'"
                  @click="clickDeleteHandler(download)"
                ></el-button>
              </el-button-group>
            </div>
          </div>
          <div class="download-list-item__progress">
            <el-progress
              :percentage="download.progress * 100"
              :show-text="false"></el-progress>
          </div>
        </div>
        <div class="download-list-item__footer">
          <div class="download-list-item__status">
            <p>{{ download.statusMessage }}<span v-show="download.state === 'downloading'"> {{ getSpeedUnit(download.speed) }}</span> </p>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
export default {
  props: {
    downloads: {
      required: true,
      type: Array,
      default: [],
    }
  },

  data() {
    return {
      filter: 'all'
    }
  },

  computed: {
    filteredDownloads() {
      let downloads = [];

      this.downloads.forEach(download => {
        if (this.filter !== 'all') {
          if (this.filter === 'finished' && download.state === 'finish') {
            downloads.push(download);
          } else if (this.filter === 'downloading' && (download.state === 'downloading' || download.state === 'pending' || download.state === 'processing')) {
            downloads.push(download);
          }
        } else {
          downloads.push(download);
        }
      });

      return downloads;
    }
  },

  beforeMount() {
    this.$root.$on('download-list:filter', filter => {
      this.filter = filter;
    });
  },

  methods: {
    getDownloadTypeClassname(type) {
      let classname = 'download-list-item__title-type';

      if (type !== null) {
        if (type == 0) {
          classname += '--illustration';
        } else if (type == 1) {
          classname += '--manga';
        } else if (type == 2) {
          classname += '--ugoira'
        }
      }

      return classname;
    },

    getDownloadType(type) {
      if (type !== null) {
        if (type == 0) {
          return 'illustration';
        } else if (type == 1) {
          return 'manga';
        } else if (type == 2) {
          return 'ugoira';
        }
      }

      return 'undetermined';
    },

    getSpeedUnit(speed) {
      if (speed < 1000) {
        return Math.round(speed / 8) + ' B/s';
      } else if (speed < 1000000) {
        return Math.round(speed / 1000 / 8) + ' KB/s';
      } else {
        return Math.round(speed / 1000 / 1000 / 8) + ' MB/s'
      }
    },

    clickStopHandler(download) {
      if (download.state === 'processing') {
        this.$alert('Cannot stop download in processing state');
        return;
      }

      this.$emit('stop', download);
    },

    clickDeleteHandler(download) {
      if (download.state === 'processing') {
        this.$alert('Cannot delete download in processing state');
      }

      this.$emit('delete', download);
    },

    openFolder(download) {
      ipcRenderer.send('download-service', {
        action: 'openFolder',
        args: {
          downloadId: download.id
        }
      });
    }
  }
}
</script>

<style lang="scss">
.download-list {
  width: 100%;
  height: 100%;
}

.download-list-item__content {
  height: 100%;
  box-sizing: border-box;
  padding: 0 10px;
  overflow-y: auto;
}

.download-list-item {
  position: relative;
  margin: 10px 0;
  padding: 15px 10px;
  border-radius: 5px;
  background: #fff;
  // border: 1px solid #dadada;
  // box-shadow: 0 1px 1px #dedede;

  &:hover {
    -webkit-box-shadow: 0 2px 12px 0 rgba(0,0,0,.2);
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.2);
  }

  .el-card__body {
    padding: 0;
  }
}

.download-list-item__mask {
  position: absolute;
  z-index: 999;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: #fff;
  opacity: 0.3;
}

.download-list-item__title-actions {
  display: flex;
  height: 32px;
  flex-direction: row;
}

.download-list-item__title {
  height: 32px;

  h3 {
    line-height: 32px;
    font-size: 14px;
    font-weight: 500;

    a {
      text-decoration: none;
      color: #3c3c3c;

      &:hover {
        color: #000;
      }
    }
  }
}

.download-list-item__title-type {
  padding: 2px 3px;
  background: #999;
  color: white;
  border-radius: 3px;
}

.download-list-item__title-type--ugoira {
  @extend .download-list-item__title-type;

  background: coral;
}

.download-list-item__title-type--illustration {
  @extend .download-list-item__title-type;

  background: brown;
}

.download-list-item__title-type--manga {
  @extend .download-list-item__title-type;

  background: cadetblue;
}

.download-list-item__actions {
  flex: 1;

  .el-button-group {
    float: right;
  }
}

.download-list-item__progress {
  margin: 10px 0;
}

.download-list-item__status {
  font-size: 12px;
  color: #9c9c9c;
}
</style>
