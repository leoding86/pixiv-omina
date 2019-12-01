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
      <el-button
        icon="el-icon-setting"
        size="small"
        @click="showSettingsDialog = true"
      ></el-button>
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

      downloadFilter: 'all'
    }
  },

  computed: {
    filter() {
      return this.downloadFilter;
    }
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
    z-index: 99999;
  }
}
</style>
