<template>
  <el-form ref="settingsForm" size="mini" :model="scopedSettings" :label-width="formLabelWidth">
    <el-form-item :label="$t('_start_download_while_startup')" :label-width="formLabelWidth">
      <el-switch v-model="scopedSettings.autostartDownload"></el-switch>
    </el-form-item>

    <el-form-item :label="$t('_save_to')" :label-width="formLabelWidth">
      <directory-selector v-model="scopedSettings.saveTo"></directory-selector>
    </el-form-item>

    <el-form-item
      :label="$t('_convert_ugoira_to_gif')"
      prop="convertUgoiraToGif"
    >
      <el-switch v-model="scopedSettings.convertUgoiraToGif"></el-switch>
    </el-form-item>

    <el-form-item
      :label="$t('_gif_convert_workers')"
      prop="gifConvertWorkers"
    >
      <el-input v-model="scopedSettings.gifConvertWorkers"></el-input>
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
      formLabelWidth: "160px",

      scopedSettings: {
        convertUgoiraToGif: true,
        autostartDownload: true,
        gifConvertWorkers: 3,
        saveTo: ''
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
          if (key === 'gifConvertWorkers' && !/^[1-9]\d*$/.test(value[key])) {
            value[key] = 1;
          }

          updatedSettings[key] = value[key];
        }
      });

      this.scopedSettings = Object.assign({}, this.scopedSettings, updatedSettings);
    },

    scopedSettings: {
      handler(value, oldValue) {
        this.$refs.settingsForm.validate((pass, failed) => {
          if (pass) {
            this.$emit('changed', Object.assign({}, value));
          }
        });
      },

      deep: true
    }
  }
};
</script>
