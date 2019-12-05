<template>
  <div class="app-about">
    <div class="app-about-row">
      <img class="app-about-icon" src="@/../../build/icon.png">
    </div>
    <div class="app-about-row">
      Version {{packageInfo.version}}
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  data() {
    return {
      formLabelWidth: '100px',

      packageInfo: require('@/../../package.json'),

      scopedSettings: {
        enableProxy: false
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

<style lang="scss">
.app-about-row {
  margin: 5px 0;
}

.app-about-icon {
  width: 50px;
}
</style>
