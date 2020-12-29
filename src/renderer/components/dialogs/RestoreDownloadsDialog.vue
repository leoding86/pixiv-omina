<template>
  <el-dialog custom-class="app-dialog add-download-dialog"
    append-to-body
    :title="$t('_unfinished_downloads_found')"
    :show-close="false"
    :close-on-click-modal="false"
    :width="'400px'"
    :visible.sync="show"
  >
    <el-tabs
      v-model="currentTab"
    >
      <el-tab-pane
        :label="$t('_restore_downloads')"
      >
        <el-form
          ref="form"
          size="mini"
          :model="formData"
          :label-width="formLabelWidth"
        >
          <el-form-item
            :label="$t('_save_to')"
          >
            <directory-selector
              v-model="formData.saveTo"
            ></directory-selector>
          </el-form-item>
          <el-form-item>
            <el-button
              @click="formData.saveTo = ''"
              size="mini"
            >{{ $t('_clear_path') }}</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    <span
      slot="footer"
      class="dialog-footer"
    >

      <el-tooltip effect="dark" placement="top"
        :content="$t('_clear_cached_downloads_and_close')"
      >
        <el-button
          @click="clearAndCancel()"
          type="warning"
          size="mini"
        >{{ $t('_clear_and_close') }}</el-button>
      </el-tooltip>
      <el-divider direction="vertical"></el-divider>
      <el-button
        @click="$emit('update:show', false)"
        size="mini"
      >{{ $t('_close') }}</el-button>
      <el-button
        type="primary"
        @click="restoreDownloads"
        size="mini"
      >{{ $t('_restore') }}</el-button>
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
      formData: {
        saveTo: ''
      }
    }
  },

  methods: {
    restoreDownloads() {
      ipcRenderer.send('download-service', {
        action: 'restoreDownloads',
        args: {
          saveTo: this.formData.saveTo
        }
      });

      this.$emit('update:show', false);
    },

    clearAndCancel() {
      ipcRenderer.send('download-service', {
        action: 'clearCachedDownloads'
      });

      this.$emit('update:show', false);
    }
  }
}
</script>
