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
  }
}
