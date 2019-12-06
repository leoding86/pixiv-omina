<template>
  <el-form ref="settingsForm" size="mini" :model="scopedSettings" :rules="settingsRule">
    <el-form-item label="Close to tray" :label-width="formLabelWidth">
      <el-switch v-model="scopedSettings.closeToTray"></el-switch>
    </el-form-item>

    <el-form-item label="User Agent" :label-width="formLabelWidth">
      <el-input type="textarea" v-model="scopedSettings.userAgent" :rows="4"></el-input>
    </el-form-item>

    <el-form-item label="Save to" :label-width="formLabelWidth">
      <directory-selector v-model="scopedSettings.saveTo"></directory-selector>
    </el-form-item>

    <el-form-item :label-width="formLabelWidth">
      <span slot="label">Format ugoira</span>
      <el-input v-model="scopedSettings.ugoiraRename"></el-input>
    </el-form-item>

    <el-form-item :label-width="formLabelWidth">
      <span slot="label">Format manga</span>
      <el-input v-model="scopedSettings.mangaRename"></el-input>
    </el-form-item>

    <el-form-item :label-width="formLabelWidth">
      <span slot="label">Format manga image</span>
      <el-input v-model="scopedSettings.mangaImageRename"></el-input>
    </el-form-item>

    <el-form-item :label-width="formLabelWidth">
      <span slot="label">Format illust</span>
      <el-input v-model="scopedSettings.illustrationRename"></el-input>
    </el-form-item>

    <el-form-item :label-width="formLabelWidth">
      <span slot="label">Format illust image</span>
      <el-input v-model="scopedSettings.illustrationImageRename"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
import { ipcRenderer } from "electron";
import DirectorySelector from "../DirectorySelector";

export default {
  components: {
    "directory-selector": DirectorySelector
  },

  data() {
    return {
      formLabelWidth: "140px",

      scopedSettings: {
        closeToTray: false,
        userAgent: '',
        saveTo: '',
        ugoiraRename: '',
        mangaRename: '',
        mangaImageRename: '',
        illustrationRename: '',
        illustrationImageRename: ''
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
};
</script>
