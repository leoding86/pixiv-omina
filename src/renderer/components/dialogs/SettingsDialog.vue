<template>
  <el-dialog
    append-to-body
    custom-class="app-dialog"
    :title="$t('_settings')"
    :show-close="false"
    :close-on-click-modal="false"
    :width="'640px'"
    :visible.sync="show"
  >
    <el-tabs
      v-model="currentTab"
    >
      <el-tab-pane
        :label="$t('_general')"
        name="general"
      >
        <general-settings
          @changed="settingsChangedHandler"
        ></general-settings>
      </el-tab-pane>

      <el-tab-pane
        :label="$t('_rename')"
        name="rename"
      >
        <rename-settings
          @changed="settingsChangedHandler"
        ></rename-settings>
      </el-tab-pane>

      <el-tab-pane
        :label="$t('_download')"
        name="download"
      >
        <download-settings
          @changed="settingsChangedHandler"
        ></download-settings>
      </el-tab-pane>

      <el-tab-pane
        :label="$t('_proxy')"
        name="proxy"
      >
        <proxy-settings
          @changed="settingsChangedHandler"
        ></proxy-settings>
      </el-tab-pane>

      <el-tab-pane
        :label="$t('_help')"
        name="help"
      >
        <app-help></app-help>
      </el-tab-pane>

      <el-tab-pane
        :label="$t('_about')"
        name="about"
      >
        <app-about></app-about>
      </el-tab-pane>
    </el-tabs>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        @click="$emit('update:show', false)"
        size="mini"
      >{{ $t('_close') }}</el-button>
      <el-button
        @click="resetSettings"
        size="mini"
      >{{ $t('_reset') }}</el-button>
      <el-button
        type="primary"
        @click="saveSettings"
        size="mini"
      >{{ $t('_save') }}<span v-if="settingsChanged">*</span></el-button>
    </div>
  </el-dialog>
</template>

<script>
import { ipcRenderer } from 'electron';
import GeneralSettings from './GeneralSettings';
import ProxySettings from './ProxySettings';
import RenameSettings from './RenameSettings';
import DownloadSettings from './DownloadSettings';
import Help from '../Help';
import About from '../About';

export default {
  components: {
    'general-settings': GeneralSettings,
    'proxy-settings': ProxySettings,
    'rename-settings': RenameSettings,
    'download-settings': DownloadSettings,
    'app-help': Help,
    'app-about': About
  },

  props: {
    show: {
      required: true,
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      settingsChanged: false,
      currentTab: 'general'
    }
  },

  beforeMount() {
    this.changedSettings = {};
    this.scopedSettings = Object.assign({}, this.settings);

    ipcRenderer.on('setting-service:permission-error', this.permissionErrorHandler);
  },

  beforeDestroy() {
    ipcRenderer.removeListener('setting-service:permission-error', this.permissionErrorHandler);
  },

  watch: {
    settings(value) {
      this.scopedSettings = value;
    }
  },

  methods: {
    settingsChangedHandler(changedSettings) {
      Object.keys(changedSettings).forEach(key => {
        this.changedSettings[key] = changedSettings[key];
      });

      this.settingsChanged = !!this.diffSettings(this.changedSettings);
    },

    resetSettings() {
      if (window.confirm(this.$t('_reset_settings_confirmation'))) {
        console.log('reset settings button is clicked');
        ipcRenderer.send('setting-service', {
          action: 'resetSettings'
        });
      }
    },

    saveSettings() {
      const changedSettings = this.diffSettings(this.changedSettings);

      if (changedSettings !== null) {
        ipcRenderer.send('setting-service', {
          action: 'updateSettings',
          args: {
            settings: changedSettings
          }
        });
      }
    },

    permissionErrorHandler() {
      alert(this.$t('_you_don_t_have_permission_for_saving_data_in_installation_directory_install_application_in_other_directory_which_you_have_write_permission_or_run_application_as_administrator_might_fix_it'));
    }
  }
}
</script>
