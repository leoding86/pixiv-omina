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
          <p>Version {{packageInfo.version}}</p>
          <p>{{ versionStatus }}</p>
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

      newVersion: null
    };
  },

  computed: {
    iconClass() {
      if (this.newVersion) {
        return 'el-icon-warning';
      } else if (this.checkingUpdate) {
        return 'el-icon-loading';
      }

      return 'el-icon-success';
    },

    versionStatus() {
      if (this.checkingUpdate) {
        return 'Checking';
      } else if (this.newVersion) {
        return `New version avaliable ${this.newVersion}`;
      }

      return `It's up to date`;
    }
  },

  beforeMount() {
    this.checkingUpdate = true;

    this.findNewVersoinHandler_ = this.findNewVersoinHandler.bind(this);
    this.checkUpdateCompleteHandler_ = this.checkUpdateCompleteHandler.bind(this);

    ipcRenderer.send('update-service', {
      action: 'checkUpdate'
    });

    ipcRenderer.on('update-service:find-new-version', this.findNewVersoinHandler_);

    ipcRenderer.on('update-service:complete', this.checkUpdateCompleteHandler_);
  },

  beforeDestroy() {
    ipcRenderer.on('update-service:find-new-version', this.findNewVersoinHandler_);
    ipcRenderer.on('update-service:complete', this.checkUpdateCompleteHandler_);
  },

  methods: {
    findNewVersoinHandler(event, version) {
      this.newVersion = version;
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
}
</style>
