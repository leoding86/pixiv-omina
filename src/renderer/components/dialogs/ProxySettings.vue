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
      >Enable proxy</span>
      <el-switch v-model="scopedSettings.enableProxy"></el-switch>
    </el-form-item>

    <el-form-item
      :label-width="formLabelWidth"
    >
      <span
        slot="label"
      >Proxy service</span>

      <el-input style="display:inline-block;width:125px;"
        placeholder="127.0.0.1"
        v-model="scopedSettings.proxyService"
      ></el-input>
      :
      <el-input style="display:inline-block;width:75px;"
        placeholder="1080"
        v-model="scopedSettings.proxyServicePort"
      ></el-input>
    </el-form-item>

    <el-form-item
      :label-width="formLabelWidth"
    >
      <span
        slot="label"
      >Enable auth</span>
      <el-switch v-model="scopedSettings.enableProxyAuth"></el-switch>
    </el-form-item>

    <el-form-item
      :label-width="formLabelWidth"
    >
      <span
        slot="label"
      >Username</span>
      <el-input
        placeholder="Username"
        v-model="scopedSettings.proxyUsername"
      ></el-input>
    </el-form-item>

    <el-form-item
      :label-width="formLabelWidth"
    >
      <span
        slot="label"
      >Password</span>
      <el-input
        placeholder="Password"
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
      this.scopedSettings = value;
    },

    scopedSettings: {
      handler(value) {
        this.$emit('changed', value);
      },

      deep: true
    }
  }
}
</script>
