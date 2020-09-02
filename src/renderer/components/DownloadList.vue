<template>
  <div class="download-list">
    <div class="download-list-item__content">
      <recycle-scroller
        :items="filteredDownloads"
        :item-size="120"
        page-mode
        key-field="id"
        v-slot="{ item }"
      >
        <el-card class="download-list-item"
          :class="{'download-list-item--selected': item.selected}"
          @click.stop.native="downloadClickHandler(item, $event)"
          :key=item.id
        >
          <div :class="getDownloadTypeClassname(item.type)">{{ getDownloadType(item.type) }}</div>

          <div class="download-list-item__mask"
            v-if="item.frozing"></div>
          <div class="download-list-item__body">
            <div class="download-list-item__title-actions">
              <div class="download-list-item__title">
                <p><a target="_blank" :href="`https://www.pixiv.net/artworks/${item.id}`">{{ item.title }} <i class="el-icon-link"></i></a></p>
              </div>
              <div class="download-list-item__actions">
                <el-button-group>
                  <el-button
                    v-if="item.state === 'stop' || item.state === 'error'"
                    type="primary"
                    size="mini"
                    icon="el-icon-video-play"
                    @click.stop.prevent="$emit('start', item)"
                  ></el-button>
                  <el-button
                    v-if="item.state === 'processing' || item.state === 'downloading'"
                    type="primary"
                    size="mini"
                    icon="el-icon-video-pause"
                    @click.stop.prevent="clickStopHandler(item)"
                  ></el-button>
                  <el-button
                    v-if="item.state === 'finish'"
                    type="primary"
                    size="mini"
                    icon="el-icon-folder"
                    @click.stop.prevent="openFolder(item)"
                  ></el-button>
                  <!-- Hidden redownload button -->
                  <el-button
                    v-if="false && item.state === 'finish'"
                    type="primary"
                    size="mini"
                    icon="el-icon-refresh"
                    @click.stop.prevent="item.state === 'finish' && $emit('redownload', item)"
                  ></el-button>
                  <el-button
                    type="danger"
                    size="mini"
                    icon="el-icon-delete"
                    @click.stop.prevent="clickDeleteHandler(item)"
                  ></el-button>
                </el-button-group>
              </div>
            </div>
            <div class="download-list-item__progress">
              <el-progress
                :percentage="item.progress * 100"
                :show-text="false"></el-progress>
            </div>
          </div>
          <div class="download-list-item__footer">
            <div class="download-list-item__status">
              <p>{{ item.statusMessage }}<span v-show="item.state === 'downloading'"> {{ getSpeedUnit(item.speed) }}</span> </p>
            </div>
          </div>
        </el-card>
      </recycle-scroller>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import { RecycleScroller } from 'vue-virtual-scroller';

export default {
  components: {
    'recycle-scroller': RecycleScroller
  },

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
      this.$emit('stop', download);
    },

    clickDeleteHandler(download) {
      this.$emit('delete', download);
    },

    downloadClickHandler(download, event) {
      this.$emit('clickDownload', { download, event });
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
  border: 2px solid #fff;
  // border: 1px solid #dadada;
  // box-shadow: 0 1px 1px #dedede;

  &:hover {
    -webkit-box-shadow: 0 2px 12px 0 rgba(0,0,0,.2);
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.2);
  }

  .el-card__body {
    padding: 0;
  }

  &--selected {
    border: 2px solid #409EFF;
    background: #f9fcff;
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
  flex: 1;
  height: 32px;
  overflow: hidden;

  p {
    height: 32px;
    line-height: 32px;
    font-size: 14px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  a {
    text-decoration: none;
    color: #3c3c3c;

    &:hover {
      color: #000;
    }
  }
}

.download-list-item__title-type {
  padding: 1px 2px;
  background: #999;
  color: white;
  box-sizing: border-box;
  border-radius: 3px;
  text-align: center;
  font-size: 12px;
  position: absolute;
  top: 0;
  left: 0;
}

.download-list-item__title-type--ugoira {
  @extend .download-list-item__title-type;

  background: rgb(255, 170, 139);
}

.download-list-item__title-type--illustration {
  @extend .download-list-item__title-type;

  background: rgb(226, 118, 118);
}

.download-list-item__title-type--manga {
  @extend .download-list-item__title-type;

  background: rgb(146, 215, 218);
}

.download-list-item__actions {
  width: 100px;

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
