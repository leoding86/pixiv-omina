<template>
  <el-form ref="settingsForm" size="mini" :model="scopedSettings" :rules="settingsRule">
    <el-form-item :label-width="formLabelWidth"
      label="Save ugoira in subfolder"
    >
      <el-switch v-model="scopedSettings.saveUgoiraInSubfolder"></el-switch>
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

    <el-form-item :label-width="formLabelWidth"
      label="Save illust in subfolder"
    >
      <el-switch v-model="scopedSettings.saveIllustrationInSubfolder"></el-switch>
    </el-form-item>

    <el-form-item :label-width="formLabelWidth">
      <span slot="label">Format illust</span>
      <el-input :disabled="!scopedSettings.saveIllustrationInSubfolder" v-model="scopedSettings.illustrationRename"></el-input>
    </el-form-item>

    <el-form-item :label-width="formLabelWidth">
      <span slot="label">Format illust image</span>
      <el-input v-model="scopedSettings.illustrationImageRename"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  data() {
    return {
      formLabelWidth: "160px",

      scopedSettings: {
        saveUgoiraInSubfolder: true,
        saveIllustrationInSubfolder: true,
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
      const updatedSettings = {}

      Object.keys(this.scopedSettings).forEach(key => {
        if (value[key] !== undefined) {
          updatedSettings[key] = value[key];
        }
      });

      this.scopedSettings = Object.assign({}, this.scopedSettings, updatedSettings);
    },

    scopedSettings: {
      handler(value) {
        this.$emit('changed', Object.assign({}, value));
      },

      deep: true
    }
  }
};
</script>
