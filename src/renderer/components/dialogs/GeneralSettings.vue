<template>
  <el-form ref="settingsForm" size="mini" :model="scopedSettings"
    :rules="settingsRule"
    :label-width="formLabelWidth"
  >
    <el-form-item :label="$t('_language')">
      <el-select v-model="scopedSettings.locale">
        <el-option v-for="(lang, local) in avaliableLocales"
          :key="local"
          :label="lang"
          :value="local"
        ></el-option>
      </el-select>
    </el-form-item>

    <el-form-item :label="$t('_close_to_tray')">
      <el-switch v-model="scopedSettings.closeToTray"></el-switch>
    </el-form-item>

    <el-form-item :label="$t('_show_notification')">
      <el-switch v-model="scopedSettings.showNotification"></el-switch>
    </el-form-item>

    <el-form-item :label="$t('_user_agent')">
      <el-input type="textarea" v-model="scopedSettings.userAgent" :rows="4"></el-input>
    </el-form-item>

    <el-form-item :label="$t('_single_user_mode')">
      <el-switch v-model="scopedSettings.singleUserMode"></el-switch>
      <el-tooltip effect="dark" placement="top"
        :content="$t('_save_settings_and_other_data_in_installation_folder_if_it_s_enabled')"
      >
        <i class="el-icon-info"></i>
      </el-tooltip>
    </el-form-item>

    <el-form-item :label="$t('_reload_theme')">
      <el-button @click="reloadTheme">{{ $t('_reload') }}</el-button>
    </el-form-item>

    <el-form-item :label="$t('_log')">
      <el-button @click="openLogs">{{ $t('_open_log') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  data() {
    return {
      formLabelWidth: "140px",

      scopedSettings: {
        closeToTray: false,
        showNotification: true,
        locale: 'en',
        userAgent: '',
        singleUserMode: false
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
  },

  methods: {
    reloadTheme() {
      ipcRenderer.send('theme-service', {
        action: 'reloadTheme',
        args: { }
      });
    },

    openLogs() {
      ipcRenderer.send('setting-service', {
        action: 'openLogs'
      });
    }
  }
};
</script>
