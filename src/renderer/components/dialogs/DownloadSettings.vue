<template>
  <el-form ref="settingsForm" size="mini" :model="scopedSettings" :rules="settingsRule">
    <!-- <el-form-item :label="$t('_save_ugoira_to')" :label-width="formLabelWidth">
      <directory-selector v-model="scopedSettings.saveUgoiraToLocation"></directory-selector>
    </el-form-item> -->
    <el-form-item>
      <span slot="label"><i class="el-icon-warning-outline" style="position:relative;top:2px;font-size:14px;font-weight:700;"></i> {{ $t('_the_path_wills_suffix_to_download_location') + ' ' + settings.saveTo}}</span>
    </el-form-item>

    <el-form-item :label-width="formLabelWidth"
      :label="$t('_folders_for_saving_ugoira')"
      prop="saveUgoiraToRelativeFolder"
    >
      <el-input v-model="scopedSettings.saveUgoiraToRelativeFolder"></el-input>
    </el-form-item>

    <!-- <el-form-item :label="$t('_save_illustration_to')" :label-width="formLabelWidth">
      <directory-selector v-model="scopedSettings.saveIllustrationToLocation"></directory-selector>
    </el-form-item> -->

    <el-form-item :label-width="formLabelWidth"
      :label="$t('_folders_for_saving_illustration')"
    >
      <el-input v-model="scopedSettings.saveIllustrationToRelativeFolder"></el-input>
    </el-form-item>

    <!-- <el-form-item :label="$t('_save_manga_to')" :label-width="formLabelWidth">
      <directory-selector v-model="scopedSettings.saveMangaToLocation"></directory-selector>
    </el-form-item> -->

    <el-form-item :label-width="formLabelWidth"
      :label="$t('_folders_for_saving_manga')"
    >
      <el-input v-model="scopedSettings.saveMangaToRelativeFolder"></el-input>
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
      formLabelWidth: "100px",

      scopedSettings: {
        saveUgoiraInSubfolder: true,
        saveIllustrationInSubfolder: true,
        saveIllustrationToLocation: '',
        saveUgoiraToLocation: '',
        saveMangaToLocation: '',
        saveUgoiraToRelativeFolder: '',
        saveMangaToRelativeFolder: '',
        saveIllustrationToRelativeFolder: ''
      },

      settingsRule: {
        saveUgoiraToRelativeFolder: [
          {
            validator: this.checkFoldersFormat
          }
        ],

        saveIllustrationToRelativeFolder: [
          {
            validator: this.checkFoldersFormat
          }
        ],

        saveMangaToRelativeFolder: [
          {
            validator: this.checkFoldersFormat
          }
        ]
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
      handler(value, oldValue) {
        this.$refs.settingsForm.validate((pass, failed) => {
          if (pass) {
            this.$emit('changed', Object.assign({}, value));
          }
        });
      },

      deep: true
    }
  },

  methods: {
    checkFoldersFormat(rule, value, callback) {
      if (/^[^/]([^<>:"'?@#$&\.*\s]+\/)*$/i.test(value)) {
        callback();
      } else {
        callback(Error('Please not include <>:"\'?@#$&\.* and spaces and not start with / and end with /'));
      }
    }
  }
};
</script>
