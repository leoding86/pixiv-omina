<template>
  <el-dialog
    append-to-body
    custom-class="app-dialog add-download-dialog"
    title="Add download"
    :show-close="false"
    :close-on-click-modal="false"
    :width="'400px'"
    :visible.sync="show"
    v-loading="checking"
    element-loading-text="Checking user login status..."
  >
    <el-form
      ref="addDownloadForm"
      size="mini"
      :model="download"
      :rules="addDownloadRule"
    >
      <el-form-item
        label="URL"
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
import { ipcRenderer, clipboard } from 'electron';
import DirectorySelector from '../DirectorySelector';
import UrlMatcher from '@/../utils/UrlMatcher';
import User from '@/../renderer/modules/User';

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
          { required: true, message: 'Please input url', trigger: 'blur' }
        ]
      },

      checking: false
    };
  },

  beforeMount() {
    let text = clipboard.readText('selection').trim();

    if (UrlMatcher.isMatch(text)) {
      this.download.url = text;
    }

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
          /**
           * Check user login status
           */
          this.checking = true;

          User.checkLogin().then(() => {
            this.$emit('update:show', false);

            ipcRenderer.send('download-service', {
              action: 'createDownload',
              args: this.download
            });
          }).catch(() => {
            this.$message('You are not logined');
            this.$emit('user:logout');
          }).finally(() => {
            this.checking = false;
          });
        } else {
          return false;
        }
      });
    }
  }
}
</script>

<style lang="scss">
.add-download-dialog {
  .el-dialog__body {
    padding: 10px 20px;
  }
}
</style>
