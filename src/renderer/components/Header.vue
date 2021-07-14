<template>
  <div class="header-container">
    <div class="header__left">
      <el-button
        icon="el-icon-plus"
        size="small"
        @click="showAddDownloadDialog = true"
      ></el-button>

      <slot></slot>
    </div>
    <div class="header__right">
      <el-button class="el-button--icon" size="small" @click="jumpTo('https://github.com/leoding86/webextension-pixiv-toolkit')">
        <img :src="require('../../../static/github.svg').default" alt="Github">
        Star it</el-button>
      <!-- <el-button class="el-button--icon" size="small" @click="jumpTo('https://www.patreon.com/leoding')">
        <img :src="require('../../../static/patreon.png').default" alt="Patreon">
        Support it
      </el-button> -->

      <el-button class="el-button--icon" size="small" icon="el-icon-time"
        @click="showTaskSchedulerDialog = true"
      ></el-button>

      <el-button class="el-button--icon" size="small" icon="el-icon-box"
        @click="showPluginsDialog = true"
      ></el-button>

      <div class="settings-button"
        :style="{zIndex: 99999}"
      >
        <i v-if="hasNewVersion"
          class="el-icon-top settings-button__update-icon"
        ></i>
        <el-button
          icon="el-icon-setting"
          size="small"
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

    <task-scheduler-dialog
      v-if="showTaskSchedulerDialog"
      :show.sync="showTaskSchedulerDialog"
    ></task-scheduler-dialog>

    <plugins-dialog
      v-if="showPluginsDialog"
      :show.sync="showPluginsDialog"
    ></plugins-dialog>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import AddDownloadDialog from './dialogs/AddDownloadDialog';
import SettingsDialog from './dialogs/SettingsDialog';
import TaskSchedulerDialog from './dialogs/TaskSchedulerDialog.vue';
import PluginsDialog from './dialogs/PluginsDialog.vue';

export default {
  components: {
    'add-download-dialog': AddDownloadDialog,
    'settings-dialog': SettingsDialog,
    'task-scheduler-dialog': TaskSchedulerDialog,
    'plugins-dialog': PluginsDialog
  },

  data() {
    return {
      showAddDownloadDialog: false,
      showSettingsDialog: false,
      showTaskSchedulerDialog: false,
      showPluginsDialog: false,
      hasNewVersion: false
    }
  },

  created() {
    ipcRenderer.on('update-service:find-new-version', () => {
      this.hasNewVersion = true;
    });
  },

  methods: {
    jumpTo(url) {
      let a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.click();
    }
  }
}
</script>

<style lang="scss">
.header-container {
  display: flex;
  flex-direction: row;

  .header__right {
    display: flex;
    justify-content: flex-end;
    position: relative;
    flex: 1;
  }
}

.settings-button {
  display: inline-block;
  position: relative;
  margin-left: 10px;

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
