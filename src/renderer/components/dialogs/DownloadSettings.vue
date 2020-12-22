<template>
  <el-form ref="settingsForm" size="mini" :model="scopedSettings" :label-width="formLabelWidth">
    <el-form-item
      :label="$t('_convert_ugoira_to_gif')"
      prop="convertUgoiraToGif"
    >
      <el-switch v-model="scopedSettings.convertUgoiraToGif"></el-switch>
    </el-form-item>
  </el-form>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  data() {
    return {
      formLabelWidth: "150px",

      scopedSettings: {
        convertUgoiraToGif: true
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
