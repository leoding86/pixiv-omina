<template>
  <el-form ref="settingsForm" size="mini" :model="scopedSettings" :rules="settingsRule"
    :label-width="formLabelWidth"
  >
    <el-divider
      content-position="left"
    >Works on Pixiv main site rename settings</el-divider>

    <el-form-item :label-width="formLabelWidth">
      <span slot="label">{{ $t('_format_ugoira') }}</span>
      <el-input v-model="scopedSettings.ugoiraRename"></el-input>
    </el-form-item>

    <el-form-item :label-width="formLabelWidth">
      <span slot="label">{{ $t('_format_manga') }}</span>
      <el-input v-model="scopedSettings.mangaRename"></el-input>
    </el-form-item>

    <!-- <el-form-item :label-width="formLabelWidth"
      :label="$t('_save_illust_in_subfolder')"
    >
      <el-switch v-model="scopedSettings.saveIllustrationInSubfolder"></el-switch>
    </el-form-item> -->

    <el-form-item :label-width="formLabelWidth">
      <span slot="label">{{ $t('_format_illust') }}</span>
      <el-input v-model="scopedSettings.illustrationRename"></el-input>
    </el-form-item>

    <el-form-item>
      <span slot="label">{{ $t('_format_novel') }}</span>
      <el-input v-model="scopedSettings.novelRename"></el-input>
    </el-form-item>

    <el-divider
      content-position="left"
    >Works on Pixiv Comic rename setting</el-divider>

    <el-form-item :label-width="formLabelWidth">
      <span slot="label">{{ $t('_format_pixiv_comic') }}</span>
      <el-input v-model="scopedSettings.pixivComicWorkRename"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  data() {
    return {
      formLabelWidth: "120px",

      scopedSettings: {
        saveIllustrationInSubfolder: true,
        ugoiraRename: '',
        mangaRename: '',
        illustrationRename: '',
        novelRename: '',
        pixivComicWorkRename: ''
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
  },

  methods: {
    goToHelp() {
      debugger;
    }
  }
};
</script>
