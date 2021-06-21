export default {
  computed: {
    logined: {
      set(val) {
        this.$root.appLogined = val;
      },

      get() {
        return this.$root.appLogined;
      }
    },

    loginError() {
      return this.$root.appLoginError;
    },

    settings() {
      return this.$root.appSettings;
    }
  },

  methods: {
    msg(message, duration = 1500) {
      this.$message({
        message: message,
        duration
      });
    },

    diffSettings(newSettings) {
      let changedSettings = null;

      Object.keys(newSettings).forEach(key => {
        if (newSettings[key] !== this.settings[key]) {
          if (changedSettings === null) {
            changedSettings = {};
          }

          changedSettings[key] = newSettings[key];
        }
      });

      return changedSettings;
    },

    isPlatform(platform) {
      return this.$root.appPlatform === platform;
    },

    isCtrlKeyHeld(event) {
      if ((this.isPlatform('windows') || this.isPlatform('linux')) && event.ctrlKey) {
        return true;
      } else if (this.isPlatform('macos') && event.metaKey) {
        return true;
      }

      return false;
    },

    isShiftKeyHeld(event) {
      return event.shiftKey;
    }
  }
}
