<template>
  <el-dialog
    append-to-body
    custom-class="app-dialog plugins-dialog"
    :title="$t('_plugins')"
    :show-close="false"
    :close-on-click-modal="false"
    :width="'480px'"
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
            <el-tag type="warning" v-if="plugin.isExternal" title="Temprary">T</el-tag>
          </div>
        </div>
        <div class="plugin-item__foot">
          <el-link v-if="plugin.loginUrl" type="primary"
            @click="login(plugin)"
          >{{ $t('_login') }}</el-link>
          <el-link type="primary"
            @click="reload(plugin)"
          >{{ $t('_reload') }}</el-link>
          <el-link type="danger"
            @click="remove(plugin)"
          >{{ $t('_remove') }}</el-link>
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
      >{{ $t('_load_temprary_plugin') }}</el-button>
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

    /**
     * Listen removed event from plugin service for removing the plugin from list
     */
    ipcRenderer.on('plugin-service:removed', (event, id) => {
      this.removePluginFromList(id);
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
    },

    /**
     * Send a action to plugin service to remove a plugin
     * @param {Object} plugin
     * @returns {void}
     */
    remove(plugin) {
      if (window.confirm(this.$t('_remove_plugin'))) {
        ipcRenderer.send('plugin-service', {
          action: 'removePlugin',
          args: {
            plugin
          }
        });
      }
    },

    /**
     * Remove the plugin from list via id
     * @param {String} id Plugin's id
     * @returns {void}
     */
    removePluginFromList(id) {
      let index = this.plugins.findIndex(plugin => plugin.id === id);

      if (index > -1) {
        this.plugins.splice(index, 1);
      }
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
  align-items: center;
  margin: 5px 0;
  padding: 8px;
  background: #f6f6f6;
  border-radius: 5px;

  .el-link {
    margin: 0 3px;
  }
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
