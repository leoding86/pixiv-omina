<template>
  <el-dialog
    append-to-body
    custom-class="app-dialog plugins-dialog"
    :title="$t('_plugins')"
    :show-close="false"
    :close-on-click-modal="false"
    :width="'400px'"
    :visible.sync="show"
  >
    <div class="plugins-dialog__wrap">
      <el-button
        v-for="(plugin, index) in plugins"
        :key="index"
        @click="login(plugin)"
      >
        <img class="plugins-dialog__item-logo" :src="plugin.icon">
        <span class="plugins-dialog__item-title">{{ plugin.title }}</span>
      </el-button>
    </div>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        @click="$emit('update:show', false)"
        size="mini"
      >{{ $t('_cancel') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  props: {
    show: {
      required: true,
      type: Boolean,
      default: false
    },

    plugins: {
      required: true,
      type: Array,
      default: []
    }
  },

  created() {
    console.log(this.plugins);
  },

  methods: {
    login(plugin) {
      ipcRenderer.send('plugin-service', {
        action: 'login',
        args: {
          id: plugin.id
        }
      });
    }
  }
}
</script>

<style lang="scss">
.plugins-dialog__wrap {
  padding: 10px 10px 0 10px;

  .el-button {
    padding: 8px 10px;
  }
}

.plugins-dialog__item-logo {
  width: 16px;
  height: 16px;
}

.plugins-dialog__item-title {
  position: relative;
  top: -2px;
}
</style>
