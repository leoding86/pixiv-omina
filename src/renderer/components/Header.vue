<template>
  <div class="header-container">
    <div class="header__left">
      <el-button
        icon="el-icon-plus"
        size="small"
        v-if="logined"
        @click="showAddDownloadDialog = true"
      ></el-button>

      <el-button-group class="header__download-filter">
        <el-tooltip
          placement="bottom"
          content="All"
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
          content="Downloading"
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
          content="finished"
        >
          <el-button
            :type="filter === 'finished' ? 'primary' : 'default'"
            size="small"
            icon="el-icon-finished"
            @click="filterDownloads('finished')"
          ></el-button>
        </el-tooltip>
      </el-button-group>
    </div>
    <div class="header__right">
      <div class="settings-button">
        <i v-if="hasNewVersion"
          class="el-icon-top settings-button__update-icon"
        ></i>
        <el-button
          icon="el-icon-setting"
          size="small"
          :style="!logined ? {zIndex: 99999} : null"
          @click="showSettingsDialog = true"
        ></el-button>
      </div>
    </div>

    <add-download-dialog
      v-if="showAddDownloadDialog"
      :show.sync="showAddDownloadDialog"
    ></add-download-dialog>

    <settings-dialog
      v-if="showSettingsDialog"
      :settings="settings"
      :show.sync="showSettingsDialog"
    ></settings-dialog>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import AddDownloadDialog from './dialogs/AddDownloadDialog';
import SettingsDialog from './dialogs/SettingsDialog';

export default {
  components: {
    'add-download-dialog': AddDownloadDialog,
    'settings-dialog': SettingsDialog
  },

  data() {
    return {
      showAddDownloadDialog: false,

      showSettingsDialog: false,

      downloadFilter: 'all',

      hasNewVersion: false
    }
  },

  computed: {
    filter() {
      return this.downloadFilter;
    }
  },

  beforeMount() {
    ipcRenderer.on('update-service:find-new-version', () => {
      this.hasNewVersion = true;
    });
  },

  methods: {
    filterDownloads(type) {
      this.downloadFilter = type;
      this.$root.$emit('download-list:filter', this.downloadFilter);
    }
  }
}
</script>

<style lang="scss">
.header-container {
  display: flex;
  flex-direction: row;

  .header__right {
    position: relative;
    flex: 1;
    text-align: right;
  }
}

.settings-button {
  display: inline-block;
  position: relative;

  &__update-icon {
    position: absolute;
    right:-5px;
    top:-5px;
    padding: 2px;
    border-radius: 100%;
    background:green;
    color: #fff;
    font-size: 12px;
  }
}

</style>
