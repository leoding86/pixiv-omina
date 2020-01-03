<template>
  <el-form
    ref="settingsForm"
    size="mini"
    :model="scopedSettings"
    :rules="settingsRule"
  >
    <el-form-item
      :label-width="formLabelWidth"
    >
      <span
        slot="label"
      >{{ $t('_enable_proxy') }}</span>
      <el-switch v-model="scopedSettings.enableProxy"></el-switch>
    </el-form-item>

    <el-form-item
      :label-width="formLabelWidth"
    >
      <span
        slot="label"
      >{{ $t('_proxy_server') }}</span>

      <el-input style="display:inline-block;width:125px;"
        :disabled="!scopedSettings.enableProxy"
        placeholder="http://127.0.0.1"
        v-model="scopedSettings.proxyService"
      ></el-input>
      :
      <el-input style="display:inline-block;width:75px;"
        :disabled="!scopedSettings.enableProxy"
        placeholder="1080"
        v-model="scopedSettings.proxyServicePort"
      ></el-input>
    </el-form-item>

    <el-form-item
      :label-width="formLabelWidth"
    >
      <span
        slot="label"
      >{{ $t('_enable_auth') }}</span>
      <el-switch
        v-model="scopedSettings.enableProxyAuth"
        :disabled="!scopedSettings.enableProxy"
      ></el-switch>
    </el-form-item>

    <el-form-item
      :label-width="formLabelWidth"
    >
      <span
        slot="label"
      >{{ $t('_username') }}</span>
      <el-input
        placeholder="Username"
        :disabled="!scopedSettings.enableProxy || !scopedSettings.enableProxyAuth"
        v-model="scopedSettings.proxyUsername"
      ></el-input>
    </el-form-item>

    <el-form-item
      :label-width="formLabelWidth"
    >
      <span
        slot="label"
      >{{ $t('_password') }}</span>
      <el-input
        placeholder="Password"
        :disabled="!scopedSettings.enableProxy || !scopedSettings.enableProxyAuth"
        v-model="scopedSettings.proxyPassword"
        type="password"
      ></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  data() {
    return {
      formLabelWidth: '100px',

      scopedSettings: {
        enableProxy: false,
        proxyService: '',
        proxyServicePort: '',
        enableProxyAuth: false,
        proxyUsername: '',
        proxyPassword: ''
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
}
</script>
