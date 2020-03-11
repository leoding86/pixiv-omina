<template>
  <el-dialog
    append-to-body
    custom-class="app-dialog"
    :title="$t('_settings')"
    :show-close="false"
    :close-on-click-modal="false"
    :width="'480px'"
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
        :label="$t('_proxy')"
        name="proxy"
      >
        <proxy-settings
          @changed="settingsChangedHandler"
        ></proxy-settings>
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
        style="float:left;"
        size="mini"
        @click="showHelp"
      >{{ $t('_help') }}</el-button>
      <el-button
        @click="$emit('update:show', false)"
        size="mini"
      >{{ $t('_close') }}</el-button>
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
import About from '../About';

export default {
  components: {
    'general-settings': GeneralSettings,
    'proxy-settings': ProxySettings,
    'rename-settings': RenameSettings,
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

    showHelp() {
      const h = this.$createElement;

      this.$msgbox({
        title: this.$t('_help'),
        message: h('div', null, [
          h('p', null, this.$t('_valid_rename_placeholders') + ': '),
          h('p', null, '%id%, $title%, %user_id%, %user_name%, %page_num%')
        ]),
        showConfirmButton: false
      }).catch(() => {
        //ignore it
      });
    }
  }
}
</script>
