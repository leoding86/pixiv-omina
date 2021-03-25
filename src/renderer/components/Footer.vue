<template>
  <div class="footer-container">
    <div class="footer-left">
      <div class="footer-btn"
        @click="loginBtnClickHandle"
      >
        <i class="el-icon-user"></i> {{ loginText }}
      </div>

      <div class="footer-btn"
        @click="toggleTasks"
      >
        {{ $t('_jobs') }}({{jobsCount}})
      </div>
      <div class="footer-status">{{ $t('_status') }}: <span :title="statusMessage">{{ statusMessage }}</span></div>
    </div>
    <div class="footer-right">
      <div class="footer-btn"
        @click="showPluginsDialog = true"
        :title="$t('_plugins')"
      >
        <i class="el-icon-box"></i>
      </div>
      <div class="footer-btn"
        @click="openDevTools()"
        :title="$t('_toggle_development_tools')"
      >
        <i class="el-icon-view"></i>
      </div>
      <div class="footer-btn"
        :title="$t('_feedback')"
      >
        <a :href="bugsUrl" target="_blank"><i class="el-icon-warning-outline"></i></a>
      </div>
    </div>

    <plugins-dialog
      :show.sync="showPluginsDialog"
      :plugins="plugins"
    >
    </plugins-dialog>
  </div>
</template>

<script>
import packageInfo from '@/../../package.json';
import { ipcRenderer } from 'electron';
import BaseMixin from '@/../renderer/mixins/BaseMixin';
import PluginsDialog from './dialogs/PluginsDialog';

export default {
  mixins: [
    BaseMixin
  ],

  components: {
    'plugins-dialog': PluginsDialog
  },

  props: {
    jobsCount: {
      required: true
    }
  },

  data() {
    return {
      bugsUrl: packageInfo.bugs.url,
      showTasks: false,
      statusMessage: '',
      showPluginsDialog: false,
      plugins: []
    }
  },

  computed: {
    loginText() {
      return this.logined ? this.$t('_logined') : this.$t('_not_logined');
    }
  },

  beforeMount() {
    ipcRenderer.on('debug-service:status', (event, data) => {
      console.log(`[PO] - ${this.statusMessage}`);
      this.statusMessage = data.statusMessage;
    });

    ipcRenderer.on('debug-service:devToolsOpened', (event, data) => {
      this.$emit('devToolsToggled', true);
    });

    ipcRenderer.on('debug-service:devToolsClosed', (event, data) => {
      this.$emit('devToolsToggled', false);
    });

    ipcRenderer.on('plugin-service:loaded', (event, plugins) => {
      this.plugins = plugins;
    });

    ipcRenderer.send('plugin-service', {
      action: 'loadPlugins'
    });
  },

  methods: {
    toggleTasks() {
      this.$emit('tasksToggled', this.showTasks = !this.showTasks);
    },

    openDevTools() {
      ipcRenderer.send('debug-service', {
        action: 'openDevTools',
        args: {
          window: 'app'
        }
      });
    },

    loginBtnClickHandle() {
      if (this.logined) {
        if (window.confirm(this.$t('_are_you_sure_logout'))) {
          ipcRenderer.send('user-service', {
            action: 'userLogout'
          });
        }
      } else {
        ipcRenderer.send('user-service', {
          action: 'userLogin'
        });
      }
    }
  }
}
</script>

<style lang="scss">
.footer-container {
  $height: 25px;

  display: flex;
  height: $height;
  overflow: hidden;

  .footer-left {
    //
  }

  .footer-right {
    flex: 1;
    text-align: right;
  }

  .footer-status {
    display: inline-block;
    height: $height;
    line-height: $height;
    vertical-align: top;
    color: #333;
    font-size: 12px;
    padding: 0 8px;
  }

  .footer-btn {
    display: inline-block;
    height: $height;
    font-size: 12px;
    line-height: $height;
    padding: 0 8px;
    cursor: pointer;
    vertical-align: top;
    color: #333;

    &:hover {
      background: #c6c6c6;
    }

    a {
      color: #333;
      text-decoration: none;
    }

    i {
      position: relative;
      top: 2px;
      font-size: 16px;
    }
  }
}
</style>
