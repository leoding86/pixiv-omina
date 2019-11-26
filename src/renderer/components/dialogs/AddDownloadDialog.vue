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
      size="mini"
      :model="download"
      :rules="addDownloadRule"
    >
      <el-form-item
        label="Work url"
        :label-width="formLabelWidth"
      >
        <el-input
          ref="urlInput"
          v-model="download.url"
        ></el-input>
      </el-form-item>

      <el-form-item
        label="Save to"
        :label-width="formLabelWidth"
      >
        <directory-selector
          v-model="download.saveTo"
        ></directory-selector>
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
      formLabelWidth: '80px',

      download: {
        url: '',
        saveTo: ''
      },

      addDownloadRule: {
        url: [
          { required: true, message: 'Please input work url', trigger: 'blur' }
        ]
      }
    };
  },

  beforeMount() {
    this.download.saveTo = this.settings.saveTo;
  },

  mounted() {
    setImmediate(() => {
      this.$refs.urlInput.focus();
    });
  },

  methods: {
    addDownload() {
      this.$refs['addDownloadForm'].validate((valid) => {
        if (valid) {
          this.$emit('update:show', false);

          ipcRenderer.send('download-service', {
            action: 'createDownload',
            args: this.download
          });
        } else {
          return false;
        }
      });
    }
  }
}
</script>
