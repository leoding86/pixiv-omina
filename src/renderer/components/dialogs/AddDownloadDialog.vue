<template>
  <el-dialog
    append-to-body
    custom-class="app-dialog add-download-dialog"
    title="Add download"
    :show-close="false"
    :close-on-click-modal="false"
    :width="'400px'"
    :visible.sync="show"
  >
    <el-form
      ref="addDownloadForm"
      :model="download"
      :rules="addDownloadRule"
    >
      <el-form-item
        label="Work url"
        :label-width="formLabelWidth"
      >
        <el-input
          v-model="download.url"
          size="small"
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
        @click="addDownload"
        size="mini"
      >Add</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  props: {
    show: {
      required: true,
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      formLabelWidth: '80px',

      download: {
        url: ''
      },

      addDownloadRule: {
        url: [
          { required: true, message: 'Please input work url', trigger: 'blur' }
        ]
      }
    };
  },

  methods: {
    addDownload() {
      this.$refs['addDownloadForm'].validate((valid) => {
        if (valid) {
          this.$emit('update:show', false);

          ipcRenderer.send('download-service', {
            action: 'createDownload',
            args: {
              url: this.download.url
            }
          });
        } else {
          return false;
        }
      });
    }
  }
}
</script>
