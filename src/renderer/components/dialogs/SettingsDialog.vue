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
      :model="settings"
      :rules="settingsRule"
    >
      <el-form-item
        label="User Agent"
        :label-width="formLabelWidth"
      >
        <el-input
          v-model="settings.userAgent"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="Save to"
        :label-width="formLabelWidth"
      >
        <directory-selector
          v-model="settings.saveTo"
        ></directory-selector>
      </el-form-item>

      <el-form-item
        label="Format manga"
        :label-width="formLabelWidth"
      >
        <el-input
          v-model="settings.userAgent"
        ></el-input>
      </el-form-item>

      <el-form-item
        label="Format manga image"
        :label-width="formLabelWidth"
      >
        <el-input
          v-model="settings.userAgent"
        ></el-input>
      </el-form-item>

      <el-form-item
        label="Format illust"
        :label-width="formLabelWidth"
      >
        <el-input
          v-model="settings.userAgent"
        ></el-input>
      </el-form-item>

      <el-form-item
        label="Format illust image"
        :label-width="formLabelWidth"
      >
        <el-input
          v-model="settings.userAgent"
        ></el-input>
      </el-form-item>

    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        @click="$emit('update:show', false)"
        size="mini"
      >Cancel</el-button>
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
      formLabelWidth: '120px',

      settings: {
        userAgent: '',
        saveTo: ''
      },

      settingsRule: {
        //
      }
    };
  },

  methods: {
    saveSettings() {
      this.$refs['settingsForm'].validate((valid) => {
        if (valid) {
          this.$emit('update:show', false);

          //
        } else {
          return false;
        }
      });
    }
  }
}
</script>
