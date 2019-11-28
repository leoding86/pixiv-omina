<template>
  <div class="header-container">
    <div class="header__left">
      <el-button
        icon="el-icon-plus"
        size="small"
        v-if="logined"
        @click="showAddDownloadDialog = true"
      ></el-button>
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

      download: {
        url: ''
      },

      addDownloadRule: {
        url: [
          { required: true, message: 'Please input work url', trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    //
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
