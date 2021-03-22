<template>
  <div class="header-container">
    <div class="header__left">
      <el-button
        icon="el-icon-plus"
        size="small"
        v-if="logined"
        @click="showAddDownloadDialog = true"
      ></el-button>

      <slot></slot>
    </div>
    <div class="header__right">
      <div class="plugins-button">
        <el-button
          icon="el-icon-box"
          size="small"
          @click="showPluginsDialog = true"
        ></el-button>
      </div>

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

    <plugins-dialog
      v-if="plugins.length > 0"
      :show.sync="showPluginsDialog"
      :plugins="plugins"
    >
    </plugins-dialog>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import AddDownloadDialog from './dialogs/AddDownloadDialog';
import SettingsDialog from './dialogs/SettingsDialog';
import PluginsDialog from './dialogs/PluginsDialog';

export default {
  components: {
    'add-download-dialog': AddDownloadDialog,
    'settings-dialog': SettingsDialog,
    'plugins-dialog': PluginsDialog
  },

  data() {
    return {
      showAddDownloadDialog: false,
      showSettingsDialog: false,
      showPluginsDialog: false,
      hasNewVersion: false,
      plugins: []
    }
  },

  created() {
    ipcRenderer.on('update-service:find-new-version', () => {
      this.hasNewVersion = true;
    });

    ipcRenderer.on('plugin-service:loaded', (event, plugins) => {
      this.plugins = plugins;
    });

    ipcRenderer.send('plugin-service', {
      action: 'loadPlugins'
    });
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

.plugins-button {
  display: inline-block;
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
