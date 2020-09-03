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

  static getSettingsFile()
  {
    return path.join(app.getPath('userData'), 'config', 'settings.config');
  }

  static initSettings() {
    let settingsFile = SettingStorage.getSettingsFile();

    fs.ensureFileSync(settingsFile);

    try {
      return fs.readJsonSync(settingsFile);
    } catch (error) {
      fs.writeJsonSync(settingsFile, defaultSettings);
    }

    return fs.readJsonSync(settingsFile);
  }

  /**
   * @returns {SettingStorage}
   */
  static getStorage() {
    let settings = SettingStorage.initSettings();

    if (!SettingStorage.instance) {
      SettingStorage.instance = new SettingStorage(settings);
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
    return SettingStorage.instance.getSettings();
  }

  static getSetting(key) {
    return SettingStorage.instance.getSetting(key);
  }

  /**
   * @constructor
   */
  constructor(settings) {
    super();

    /**
     * @property {Object} defaultSettings
     */
    this.defaultSettings = defaultSettings;

    /**
     * @property {Object} settings
     */
    this.settings = Object.assign({}, this.defaultSettings, settings || {});
  }

  getSetting(key) {
    return this.settings[key];
  }

  getSettings() {
    return this.settings;
  }

  setSettings(settings) {
    for (let key in settings) {
      if (this.settings[key] !== undefined) {
        if (this.needCheckAndRebuildWorkRenameRuleSetting(key)) {
          settings[key] = this.rebuildWorkRenameRule(settings[key]);
        } else if (this.needCheckAndRebuildWorkImageRenameRuleSetting(key)) {
          settings[key] = this.rebuildWorkImageRenameRule(settings[key])
        } else if (this.needCheckAndRebuildSaveToSetting(key)) {
          settings[key] = this.rebuildSaveTo(settings[key]);
        } else if (this.needCheckAndRebuildSaveWorkToRelative(key)) {
          settings[key] = this.rebuildSaveWorkToRelative(settings[key]);
        }
      } else {
        delete settings[key];
      }
    }

    Object.assign(this.settings, settings);

    fs.writeJsonSync(SettingStorage.getSettingsFile(), this.settings);

    this.emit('change', settings);

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

  /**
   *
   * @param {string} rule
   */
  rebuildWorkRenameRule(rule) {
    rule = FormatName.replaceIllegalChars(rule, ['%', '/']).replace(/^\//g, '').replace(/\/$/g, '');

    if (rule.length === 0 || rule.indexOf('%') < 0) {
      rule = '%id%';
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
}

export default SettingStorage;
