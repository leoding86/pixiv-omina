<template>
  <el-dialog
    append-to-body
    custom-class="app-dialog"
    title="Settings"
    :show-close="false"
    :close-on-click-modal="false"
    :width="'480px'"
    :visible.sync="show"
  >
    <el-form
      ref="settingsForm"
      size="mini"
      :model="scopedSettings"
      :rules="settingsRule"
    >
      <el-form-item
        label="User Agent"
        :label-width="formLabelWidth"
      >
        <el-input
          type="textarea"
          v-model="scopedSettings.userAgent"
          :rows="4"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="Save to"
        :label-width="formLabelWidth"
      >
        <directory-selector
          v-model="scopedSettings.saveTo"
        ></directory-selector>
      </el-form-item>

      <el-form-item
        :label-width="formLabelWidth"
      >
        <span
          slot="label"
        >Format manga <i class="el-icon-warning-outline"></i></span>
        <el-input
          v-model="scopedSettings.mangaRename"
        ></el-input>
      </el-form-item>

      <el-form-item
        :label-width="formLabelWidth"
      >
        <span
          slot="label"
        >Format manga image <i class="el-icon-warning-outline"></i></span>
        <el-input
          v-model="scopedSettings.mangaImageRename"
        ></el-input>
      </el-form-item>

      <el-form-item
        :label-width="formLabelWidth"
      >
        <span
          slot="label"
        >Format illust <i class="el-icon-warning-outline"></i></span>
        <el-input
          v-model="scopedSettings.illustrationRename"
        ></el-input>
      </el-form-item>

      <el-form-item
        :label-width="formLabelWidth"
      >
        <span
          slot="label"
        >Format illust image <i class="el-icon-warning-outline"></i></span>
        <el-input
          v-model="scopedSettings.illustrationImageRename"
        ></el-input>
      </el-form-item>

    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        style="float:left;"
        size="mini"
        @click="showHelp"
      >Help</el-button>
      <el-button
        @click="$emit('update:show', false)"
        size="mini"
      >Close</el-button>
      <el-button
        type="primary"
        @click="saveSettings"
        size="mini"
      >Save</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { ipcRenderer } from 'electron';
import DirectorySelector from '../DirectorySelector';

export default {
  components: {
    'directory-selector': DirectorySelector
  },

  props: {
    show: {
      required: true,
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      formLabelWidth: '140px',

      scopedSettings: {},

      settingsRule: {
        //
      }
    };
  },

  beforeMount() {
    this.scopedSettings = Object.assign({}, this.settings);
  },

  watch: {
    settings(value) {
      this.scopedSettings = value;
    }
  },

  methods: {
    saveSettings() {
      this.$refs['settingsForm'].validate((valid) => {
        if (valid) {
          // this.$emit('update:show', false);

          ipcRenderer.send('setting-service', {
            action: 'updateSettings',
            args: {
              settings: this.scopedSettings
            }
          });
        } else {
          return false;
        }
      });
    },

    showHelp() {
      const h = this.$createElement;

      this.$msgbox({
        title: 'Help',
        message: h('div', null, [
          h('p', null, 'Valid rename placehold: '),
          h('p', null, '%id%, $title%, %user_id%, %user_name%, %page_num%')
        ]),
        showConfirmButton: false
      });
    }
  }
}
</script>
