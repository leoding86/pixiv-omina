<template>
  <div id="header">
    <div class="header__left">
      <el-button
        icon="el-icon-plus"
        size="small"
        v-if="logined"
        @click="showAddDownloadDialog = true"
      ></el-button>
    </div>
    <div class="header__right">
      <el-button
        icon="el-icon-setting"
        size="small"
      ></el-button>
    </div>

    <el-dialog
      append-to-body
      custom-class="app-dialog add-download-dialog"
      title="Add download"
      :close-on-click-modal="false"
      :width="'500px'"
      :visible.sync="showAddDownloadDialog">
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
      <span slot="footer" class="dialog-footer">
        <el-button
          @click="showAddDownloadDialog = false"
          size="small"
        >Cancel</el-button>
        <el-button
          type="primary"
          @click="addDownload"
          size="small"
        >Add</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  data() {
    return {
      showAddDownloadDialog: false,
      formLabelWidth: '80px',

      download: {
        url: ''
      },

      addDownloadRule: {
        url: [
          { required: true, message: 'Please input work url', trigger: 'blur' }
        ]
      }
    }
  },

  computed: {
    logined() {
      return this.$root.$data.logined;
    }
  },

  methods: {
    addDownload() {
      this.$refs['addDownloadForm'].validate((valid) => {
        if (valid) {
          this.showAddDownloadDialog = false;

          ipcRenderer.send('download-service', {
            action: 'createDownload',
            args: {
              url: this.workUrl
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

<style lang="scss">
#header {
  display: flex;
  flex-direction: row;
  height: 32px;
  padding: 10px;
  background: #efefef;

  .header__left {
    //
  }

  .header__right {
    flex: 1;
    text-align: right;
  }
}
</style>
