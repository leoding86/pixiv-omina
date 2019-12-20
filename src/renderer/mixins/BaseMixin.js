export default {
  computed: {
    logined() {
      return this.$root.$data.appLogined;
    },

    inited() {
      return this.$root.$data.appInited;
    },

    settings() {
      return this.$root.$data.appSettings;
    }
  },

  methods: {
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
    },

    isShiftKeyHeld(event) {
      return event.shiftKey;
    }
  }
}
