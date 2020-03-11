<template>
  <div class="app-about">
    <div class="app-about-row">
      <p class="app-about-icon"><img src="@/../../build/icon.png"><span>{{packageInfo.productName}}</span></p>
    </div>
    <div class="app-about-row">
      <div class="app-version-info">
        <div class="app-version-info__check-icon">
          <i :class="iconClass"></i>
        </div>
        <div class="app-version-info__content">
          <p>{{ $t('_version') }} {{packageInfo.version}}</p>
          <p>{{ versionStatus }} <a v-if="newVersion" target="_blank" href="https://github.com/leoding86/pixiv-omina/releases">{{ $t('view') }}</a> </p>
        </div>
      </div>
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

      checkingUpdate: false,

      checkingError: false,

      newVersion: null
    };
  },

  computed: {
    iconClass() {
      if (this.checkingError) {
        return 'el-icon-error';
      }

      if (this.newVersion) {
        return 'el-icon-warning';
      } else if (this.checkingUpdate) {
        return 'el-icon-loading';
      }

      return 'el-icon-success';
    },

    versionStatus() {
      if (this.checkingError) {
        return this.$t('_error_ocurred_when_checking_version');
      }

      if (this.checkingUpdate) {
        return this.$t('_checking');
      } else if (this.newVersion) {
        return `${this.$t('_new_version_avaliable')} ${this.newVersion}`;
      }

      return this.$t('_It_s_up_to_date');
    }
  },

  beforeMount() {
    this.checkingUpdate = true;

    this.findNewVersionHandler_ = this.findNewVersionHandler.bind(this);
    this.findNewVersionErrorHandler_ = this.findNewVersionErrorHandler.bind(this);
    this.checkUpdateCompleteHandler_ = this.checkUpdateCompleteHandler.bind(this);

    ipcRenderer.send('update-service', {
      action: 'checkUpdate'
    });

    ipcRenderer.on('update-service:find-new-version', this.findNewVersionHandler_);
    ipcRenderer.on('update-service:find-new-version-error', this.findNewVersionErrorHandler_);
    ipcRenderer.on('update-service:complete', this.checkUpdateCompleteHandler_);
  },

  beforeDestroy() {
    ipcRenderer.removeListener('update-service:find-new-version', this.findNewVersionHandler_);
    ipcRenderer.removeListener('update-service:find-new-version-error', this.findNewVersionErrorHandler_);
    ipcRenderer.removeListener('update-service:complete', this.checkUpdateCompleteHandler_);
  },

  methods: {
    findNewVersionHandler(event, version) {
      this.newVersion = version;
    },

    findNewVersionErrorHandler(event) {
      this.checkingError = true;
    },

    checkUpdateCompleteHandler() {
      this.checkingUpdate = false;
    }
  }
}
</script>

<style lang="scss">
.app-about-row {
  margin: 15px 0;
}

.app-about-icon {

  img {
    width: 45px;
    vertical-align: middle;
  }

  span {
    padding-left: 10px;
    font-weight: 700;
  }
}

.app-version-info {
  display: flex;

  span {
    padding-left: 10px;
  }
}

.app-version-info__check-icon {
  width: 40px;
  color: rgb(0, 140, 255);
  line-height: 40px;
  text-align: center;
  font-size: 20px;
}

.app-version-info__content {
  flex: auto;

  a {
    text-decoration: none;
    color: #606266;
    font-weight: 700;
  }
}
</style>
