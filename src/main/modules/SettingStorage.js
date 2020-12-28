import EventEmitter from 'events';
import FormatName from '@/modules/Utils/FormatName';
import { app } from 'electron';
import defaultSettings from '@/settings/default.settings';
import fs from 'fs-extra';
import path from 'path';

/**
 * @class
 */
class SettingStorage extends EventEmitter {

  /**
   * @returns {SettingStorage}
   */
  static instance;

  /**
   * @var {Number}
   */
  static MULTIPLE_USER_MODE = 1;

  /**
   * @var {Number}
   */
  static SINGLE_USER_MODE = 2;

  /**
   * @returns {SettingStorage}
   */
  static getStorage() {
    if (!SettingStorage.instance) {
      SettingStorage.instance = new SettingStorage();
    }

    return SettingStorage.instance;
  }

  /**
   * alias for method getStroage
   * @returns {SettingStorage}
   */
  static getDefault() {
    return SettingStorage.getStorage();
  }

  static getSettings() {
    return SettingStorage.getDefault().getSettings();
  }

  static getSetting(key) {
    return SettingStorage.getDefault().getSetting(key);
  }

  /**
   * @constructor
   */
  constructor() {
    super();

    /**
     * @property {Object} defaultSettings
     */
    this.defaultSettings = defaultSettings;

    /**
     * @property {Object} settings
     */
    this.settings;

    /**
     * Initial settings
     */
    this.initialSettings();

    this.on('change', (settings, oldSettings) => {
      Object.keys(settings).forEach(key => {
        let settingChangeHandler = `${key}SettingChangeHandler`;

        if (typeof this[settingChangeHandler] === 'function') {
          this[settingChangeHandler].call(this, settings[key], oldSettings[key]);
        }
      });
    });
  }

  getSettingsFile(mode = 1) {
    let settingFilename = 'settings.config';

    if (mode === SettingStorage.MULTIPLE_USER_MODE) {
      return path.join(app.getPath('userData'), 'config', settingFilename);
    } else {
      return path.join(app.getAppPath(), 'config', settingFilename);
    }
  }

  /**
   *
   * @param {String} file Setting file path
   * @returns {Object|null}
   */
  loadSettings(file) {
    if (fs.existsSync(file)) {
      try {
        return fs.readJSONSync(file);
      } catch (e) {
        // do nothing
      }
    }

    return null;
  }

  /**
   * Inital settings. First try to get settings from user data folder, then if
   * the running mode is matched specified setting, if not, then try to load settings
   * from installation folder and do the something like loading settings from user
   * data folder. If no settings matched, then create a new settings file in user
   * data folder with default settings.
   * @returns {void}
   */
  initialSettings() {
    /**
     * Try to load settings from user's folder
     */
    let settings = this.loadSettings(
      this.getSettingsFile(SettingStorage.MULTIPLE_USER_MODE)
    );

    if (settings && settings.singleUserMode === false) {
      this.settings = settings;
      return;
    }

    /**
     * Try to load settings from installation folder
     */
    settings = this.loadSettings(
      this.getSettingsFile(SettingStorage.SINGLE_USER_MODE)
    );

    if (settings && settings.singleUserMode === true) {
      this.settings = settings;
      return;
    }

    /**
     * Inital settings from default settings
     */
    fs.writeJsonSync(this.getSettingsFile(), defaultSettings);
  }

  getSetting(key) {
    return this.settings[key];
  }

  getSettings() {
    return this.settings;
  }

  getDefaultSettings() {
    return this.defaultSettings;
  }

  setSettings(settings) {
    let oldSettings = {};

    for (let key in settings) {
      if (this.settings[key] !== undefined) {
        if (this.needCheckAndRebuildWorkRenameRuleSetting(key)) {
          settings[key] = this.rebuildWorkRenameRule(settings[key], key);
        } else if (this.needCheckAndRebuildWorkImageRenameRuleSetting(key)) {
          settings[key] = this.rebuildWorkImageRenameRule(settings[key])
        } else if (this.needCheckAndRebuildSaveToSetting(key)) {
          settings[key] = this.rebuildSaveTo(settings[key]);
        } else if (this.needCheckAndRebuildSaveWorkToRelative(key)) {
          settings[key] = this.rebuildSaveWorkToRelative(settings[key]);
        }

        oldSettings[key] = this.settings[key];
      } else {
        delete settings[key];
      }
    }

    Object.assign(this.settings, settings);

    fs.writeJsonSync(this.getSettingsFile(), this.settings);

    this.emit('change', settings, oldSettings);

    return settings;
  }

  needCheckAndRebuildSaveWorkToRelative(key) {
    return ['saveIllustrationToRelativeFolder', 'saveUgoiraToRelativeFolder', 'saveMangaToRelativeFolder'].indexOf(key) > -1;
  }

  /**
   *
   * @param {String} folder
   */
  rebuildSaveWorkToRelative(folder) {
    return folder.replace(/\/+/g, '/');
  }

  needCheckAndRebuildWorkRenameRuleSetting(key) {
    return ['illustrationRename', 'mangaRename', 'ugoiraRename'].indexOf(key) > -1;
  }

  needCheckPageNumAndRebuild(key) {
    return ['illustrationRename', 'mangaRename'].indexOf(key) > -1;
  }

  /**
   *
   * @param {string} rule
   */
  rebuildWorkRenameRule(rule, key) {
    rule = FormatName.replaceIllegalChars(rule, ['%', '/']).replace(/^\//g, '').replace(/\/$/g, '');

    if (rule.length === 0 || rule.indexOf('%') < 0) {
      rule = '%id%';
    }

    if (this.needCheckPageNumAndRebuild(key) && rule.indexOf('%page_num%') < 0) {
      rule += `p%page_num%`;
    }

    return rule;
  }

  needCheckAndRebuildWorkImageRenameRuleSetting(key) {
    return ['illustrationImageRename', 'mangaImageRename'].indexOf(key) > -1;
  }

  /**
   *
   * @param {string} rule
   */
  rebuildWorkImageRenameRule(rule) {
    rule = FormatName.replaceIllegalChars(rule, ['%', '/']).replace(/^\//g, '').replace(/\/$/g, '');

    if (rule.length === 0 || rule.indexOf('%') < 0) {
      rule = '%id%';
    }

    if (rule.indexOf('%page_num%') < 0) {
      rule += `_p%page_num%`;
    }

    return rule;
  }

  needCheckAndRebuildSaveToSetting(key) {
    return key === 'saveTo';
  }

  rebuildSaveTo(saveTo) {
    try {
      fs.ensureDirSync(saveTo);

      return saveTo;
    } catch (error) {
      return this.defaultSettings.saveTo;
    }
  }

  /**
   *
   * @param {Boolean} newSetting
   * @param {Boolean} oldSetting
   * @returns {void}
   */
  singleUserModeSettingChangeHandler(newSetting, oldSetting) {
    let src, dest;
console.log(app.getAppPath());
    if (newSetting && !oldSetting) {
      src = this.getSettingsFile(SettingStorage.MULTIPLE_USER_MODE);
      dest = this.getSettingsFile(SettingStorage.SINGLE_USER_MODE);
    } else if (!newSetting && oldSetting) {
      src = this.getSettingsFile(SettingStorage.SINGLE_USER_MODE);
      dest = this.getSettingsFile(SettingStorage.MULTIPLE_USER_MODE);
    }

    if (src && dest) {
      fs.copySync(src, dest, {
        overwrite: true
      });
    }
  }
}

export default SettingStorage;
