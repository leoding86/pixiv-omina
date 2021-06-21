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
    <div class="plugins-dialog__no-plugins"
      v-if="plugins.length <= 0"
    >
      {{ $t('_no_plugin_installed') }}
    </div>
    <div class="plugins-dialog__wrap"
      v-else
    >
      <div class="plugin-item"
        v-for="(plugin, index) in plugins"
        :key="index"
      >
        <div class="plugin-item__head">
          <div class="plugin-item__title">
            <img v-if="plugin.icon" :src="plugin.icon">
            {{ plugin.title }}
          </div>
        </div>
        <div class="plugin-item__foot">
          <el-button v-if="plugin.loginUrl"
            size="mini"
            icon="el-icon-user"
            @click="login(plugin)"
          ></el-button>
          <el-button size="mini"
            icon="el-icon-refresh-left"
            @click="reload(plugin)"
          ></el-button>
        </div>
      </div>
    </div>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        @click="openHelp"
        size="mini"
        type="primary"
      >
        {{ $t('_help') }}
      </el-button>
      <el-button
        @click="loadTempraryPlugin"
        size="mini"
      >Load Temprary Plugin</el-button>
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
    ipcRenderer.on('plugin-service:reloaded', (event, { id, plugin }) => {
      for (let i = 0; i < this.plugins.length; i++) {
        if (id === this.plugins[i].id) {
          this.$set(this.plugins, i, plugin);
          break;
        }
      }

      this.msg(this.$t('_plugin_reloaded'));
    });
  },

  methods: {
    login(plugin) {
      ipcRenderer.send('plugin-service', {
        action: 'login',
        args: {
          id: plugin.id
        }
      });
    },

    reload(plugin) {
      ipcRenderer.send('plugin-service', {
        action: 'reload',
        args: {
          id: plugin.id
        }
      });
    },

    openHelp() {
      let a = document.createElement('a');
      a.target = "_blank";
      a.href = this.settings.locale === 'zh_CN'
               ? "https://github.com/leoding86/pixiv-omina/blob/master/docs/how-to-install-plugin_zh-CN.md"
               : "https://github.com/leoding86/pixiv-omina/blob/master/docs/how-to-install-plugin_en.md";
      a.click();
    },

    loadTempraryPlugin() {
      ipcRenderer.send('plugin-service', {
        action: 'loadTempraryPlugin',
        args: {}
      });
    }
  }
}
</script>

<style lang="scss">
.plugins-dialog__no-plugins {
  padding-top: 10px;
  text-align: center;
  color: #9e9e9e;
}

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

.plugin-item {
  display: flex;
  margin: 5px 0;
  padding: 8px;
  background: #f6f6f6;
  border-radius: 5px;
}

.plugin-item__head {
  display: flex;
  vertical-align: middle;
  align-items: center;
  flex: 1;

  img {
    width: 16px;
    height: 16px;
    position: relative;
    top: 3px;
  }
}

.plugin-item_foot {
  flex: 1;
}
</style>
