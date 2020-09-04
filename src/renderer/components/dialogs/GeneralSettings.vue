<template>
  <el-form ref="settingsForm" size="mini" :model="scopedSettings" :rules="settingsRule">
    <el-form-item :label="$t('_language')" :label-width="formLabelWidth">
      <el-select v-model="scopedSettings.locale">
        <el-option v-for="(lang, local) in avaliableLocales"
          :key="local"
          :label="lang"
          :value="local"
        ></el-option>
      </el-select>
    </el-form-item>

    <el-form-item :label="$t('_close_to_tray')" :label-width="formLabelWidth">
      <el-switch v-model="scopedSettings.closeToTray"></el-switch>
    </el-form-item>

    <el-form-item :label="$t('_start_download_while_startup')" :label-width="formLabelWidth">
      <el-switch v-model="scopedSettings.autostartDownload"></el-switch>
    </el-form-item>

    <el-form-item :label="$t('_show_notification')" :label-width="formLabelWidth">
      <el-switch v-model="scopedSettings.showNotification"></el-switch>
    </el-form-item>

    <el-form-item :label="$t('_user_agent')" :label-width="formLabelWidth">
      <el-input type="textarea" v-model="scopedSettings.userAgent" :rows="4"></el-input>
    </el-form-item>

    <el-form-item :label="$t('_save_to')" :label-width="formLabelWidth">
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
        autostartDownload: true,
        showNotification: true,
        userAgent: '',
        saveTo: '',
        locale: 'en'
      },

      avaliableLocales: {
        'en': 'English',
        'zh_CN': '简体中文'
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
