<template>
  <el-dialog
    append-to-body
    custom-class="app-dialog add-download-dialog"
    :title="$t('_add_download')"
    :show-close="false"
    :close-on-click-modal="false"
    :width="'400px'"
    :visible.sync="show"
    v-loading="checking"
    element-loading-text="Checking user login status..."
  >
    <el-tabs
      v-model="currentTab"
    >
      <el-tab-pane
        :label="$t('_url')"
        name="url"
      >
        <el-form
          ref="addUrlDownload"
          size="mini"
          :model="download"
          :rules="addDownloadRule"
          :label-width="formLabelWidth"
        >
          <el-form-item
            label="URL"
          >
            <el-input
              ref="urlInput"
              v-model="download.url"
            ></el-input>
          </el-form-item>

          <el-form-item
            v-if="isUser"
            :label="$t('_work_type')"
          >
            <el-checkbox
              v-model="download.types.ugoira"
              @change="storeDownloadType()"
            >{{ $t('_ugoira') }}</el-checkbox>
            <el-checkbox
              v-model="download.types.illustration"
              @change="storeDownloadType()"
            >{{ $t('_illustration') }}</el-checkbox>
            <el-checkbox
              v-model="download.types.manga"
              @change="storeDownloadType()"
            >{{ $t('_manga') }}</el-checkbox>
          </el-form-item>

          <el-form-item
            :label="$t('_save_to')"
          >
            <directory-selector
              v-model="download.saveTo"
            ></directory-selector>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane
        :label="$t('_bookmark')"
        name="bookmark"
      >
        <el-form
          :model="bookmarkForm"
          ref="addBmDownload"
          size="mini"
        >
          <el-form-item
            :label="$t('_bookmark_type')"
            :label-width="formLabelWidth"
          >
            <el-select
              v-model="bookmarkForm.rest"
            >
              <el-option
                :label="$t('_public')"
                value="show"
              ></el-option>
              <el-option
                :label="$t('_private')"
                value="hide"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item
            :label="$t('_mode')"
            :label-width="formLabelWidth"
          >
            <el-select
              v-model="bookmarkForm.mode"
            >
              <el-option
                value="all"
                :label="$t('_all')"
              ></el-option>
              <el-option
                value="pages"
                :label="$t('_pages')"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item
            v-if="bookmarkForm.mode === 'pages'"
            :label="$t('_pages')"
            :label-width="formLabelWidth"
          >
            <el-input
              v-model="bookmarkForm.pages"
              placeholder="1 or 1-3 or 1-3,5-10"
            ></el-input>
          </el-form-item>

          <el-form-item
            :label="$t('_save_to')"
            :label-width="formLabelWidth"
          >
            <directory-selector
              v-model="bookmarkForm.saveTo"
            ></directory-selector>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        @click="$emit('update:show', false)"
        size="mini"
      >{{ $t('_cancel') }}</el-button>
      <el-button
        type="primary"
        @click="addDownload"
        size="mini"
      >{{ $t('_add') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { ipcRenderer, clipboard } from 'electron';
import DirectorySelector from '../DirectorySelector';
import UrlMatcher from '@/../utils/UrlMatcher';
import User from '@/../renderer/modules/User';
import StorageService from '@/../renderer/modules/StorageService';

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

      currentTab: 'url',

      bookmarkForm: {
        mode: 'all',
        rest: 'show',
        pages: '',
        saveTo: ''
      },

      download: {
        url: '',
        saveTo: '',
        types: {
          ugoira: true,
          illustration: true,
          manga: true
        }
      },

      addDownloadRule: {
        url: [
          { required: true, message: this.$t('_please_input_url'), trigger: 'blur' }
        ]
      },

      checking: false
    };
  },

  computed: {
    isUser() {
      for (let i = 0, l = this.pixivUserUrlPatterns.length; i < l; i++) {
        let matches = this.download.url.match(this.pixivUserUrlPatterns[i]);

        if (matches) {
          Object.assign(this.download, {
            types: {
              ugoira: true,
              illustration: true,
              manga: true
            }
          });
          return true;
        }
      }

      return false;
    }
  },

  created() {
    this.pixivUserUrlPatterns = [
      /^https?:\/{2}www\.pixiv\.net\/member(?:_illust)?\.php\?id=(\d+)(&.*)?$/,
      /^https:\/\/www\.pixiv\.net\/(?:[a-z]+\/)?users\/(\d+)/
    ];
  },

  beforeMount() {
    let text = clipboard.readText('selection').trim();

    if (UrlMatcher.isMatch(text)) {
      this.download.url = text;
    }

    this.download.saveTo = this.bookmarkForm.saveTo = this.settings.saveTo;
  },

  mounted() {
    this.$nextTick(() => {
      this.$refs.urlInput.focus();

      this.downloadTypes = StorageService.getDefault().getOffset('download_types');

      if (Array.isArray(this.downloadTypes) && this.downloadTypes.length > 0) {
        let initalDownloadTypes = {};

        Object.keys(this.download.types).forEach(type => {
          initalDownloadTypes[type] = this.downloadTypes.indexOf(type) > -1;
        });

        this.$set(this.download, 'types', initalDownloadTypes);
      }
    });
  },

  methods: {
    isPageInRange(page, limit) {
      return page > 0 && page <= limit;
    },

    /**
     * @param {string} pages
     * @param {number} totalPages
     * @returns {string[]}
     */
    parseBookmarkPages(pages, totalPages) {
      let p = [];

      if (pages.indexOf(',')) {
        pages = pages.split(',');
      } else {
        pages = [pages];
      }

      pages.forEach(setting => {
        setting = setting.trim();

        if (/^\d+$/.test(setting)) {
          p.push(setting);
        } else {
          let matches = setting.match(/^(\d+)\-(\d+)$/);

          if (matches) {
            let diff = matches[2] - matches[1];

            if (diff === 0) {
              p.push(matches[1]);
            } else {
              let start;

              if (diff > 0) {
                start = matches[1];
                end = matches[2];
              } else if (diff < 0) {
                start = matches[2];
                end = matches[1];
              }

              while (start < end) {
                p.push(start);
                start++;
              }
            }
          }
        }
      });

      return p.filter((_p, index) => {
        return this.isPageInRange(_p, totalPages) && p.indexOf(_p) === index
      });
    },

    addDownload() {
      this.checking = true;

      User.checkLogin().then(() => {
        if (this.currentTab === 'url') {
          this.$refs['addUrlDownload'].validate(valid => {
            if (valid) {
              this.$emit('update:show', false);

              ipcRenderer.send('download-service', {
                action: 'createDownload',
                args: this.download
              });
            }
          });

          this.checking = false;
        } else if (this.currentTab === 'bookmark') {
          this.$refs['addBmDownload'].validate(valid => {
            if (valid) {
              this.$emit('update:show', false);

              ipcRenderer.once('user-service:bookmark-info', (event, args) => {
                let totalPages = args.pages,
                    pages = [];

                // Parse pages setting
                if (this.bookmarkForm.mode === 'pages') {
                  pages = this.parseBookmarkPages(this.bookmarkForm.pages, totalPages);
                } else {
                  pages = [];

                  while (args.pages > 0) {
                    pages.push(args.pages);
                    args.pages--;
                  }
                }

                if (pages.length > 0) {
                  ipcRenderer.send('download-service', {
                    action: 'createBmDownload',
                    args: {
                      rest: this.bookmarkForm.rest,
                      pages,
                      saveTo: this.bookmarkForm.saveTo,
                    }
                  });
                } else {
                  alert(this.$t('_cannot_add_bookmarks'));
                }

                this.checking = false;
              });

              ipcRenderer.once('user-service:bookmark-info-error', (event, args) => {
                this.checking = false;
                alert('Cannot get bookmark infomation');
              });

              ipcRenderer.send('user-service', {
                action: 'getBookmarkInfo',
                args: {
                  rest: 'show'
                }
              });
            }
          });
        }
      }).catch(() => {
        this.$message(this.$t('_you_need_login_first'));
        this.$emit('user:logout');
        this.checking = false;
      });
    },

    storeDownloadType(value) {
      Object.keys(this.download.types).forEach(type => {
        if (this.download.types[type]) {
          if (this.downloadTypes.indexOf(type) < 0) {
            this.downloadTypes.push(type);
          }
        } else {
          let index = this.downloadTypes.indexOf(type);

          if (index > -1) {
            this.downloadTypes.splice(index, 1);
          }
        }
      });

      StorageService.getDefault().setOffset('download_types', this.downloadTypes);
    }
  }
}
</script>

<style lang="scss">
</style>
