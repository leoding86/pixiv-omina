<template>
  <el-form ref="settingsForm" size="mini" :model="scopedSettings" :rules="settingsRule">
    <el-form-item label="Close to tray" :label-width="formLabelWidth">
      <el-switch v-model="scopedSettings.closeToTray"></el-switch>
    </el-form-item>

    <el-form-item label="Show notification" :label-width="formLabelWidth">
      <el-switch v-model="scopedSettings.showNotification"></el-switch>
    </el-form-item>

    <el-form-item label="User Agent" :label-width="formLabelWidth">
      <el-input type="textarea" v-model="scopedSettings.userAgent" :rows="4"></el-input>
    </el-form-item>

    <el-form-item label="Save to" :label-width="formLabelWidth">
      <directory-selector v-model="scopedSettings.saveTo"></directory-selector>
    </el-form-item>
  </el-form>
</template>

<script>
import { ipcRenderer } from "electron";
import DirectorySelector from "../DirectorySelector";

export default {
  components: {
    "directory-selector": DirectorySelector
  },

  data() {
    return {
      formLabelWidth: "140px",

      scopedSettings: {
        closeToTray: false,
        showNotification: true,
        userAgent: '',
        saveTo: ''
      },

      settingsRule: {
        //
      }
    };
  },

  beforeMount() {
    Object.keys(this.settings).forEach(key => {
      if (typeof this.scopedSettings[key] !== 'undefined') {
        this.scopedSettings[key] = this.settings[key];
      }
    });
  },

  watch: {
    settings(value) {
      const updatedSettings = {}

      Object.keys(this.scopedSettings).forEach(key => {
        if (value[key] !== undefined) {
          updatedSettings[key] = value[key];
        }
      });

      this.scopedSettings = Object.assign({}, this.scopedSettings, updatedSettings);
    },

    scopedSettings: {
      handler(value) {
        this.$emit('changed', Object.assign({}, value));
      },

      deep: true
    }
  }
};
</script>
