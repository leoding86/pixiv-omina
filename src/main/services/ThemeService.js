import BaseService from '@/services/BaseService';
import SettingStorage from '@/modules/SettingStorage';
import ThemeManager from '@/modules/ThemeManager';
import { debug } from '@/global';
import { ipcMain, shell } from 'electron';

class ThemeService extends BaseService {
  /**
   * @property
   * @type {ThemeService}
   */
  static instance;

  /**
   * @property
   * @type {string}
   */
  static channel = 'theme-service';

  constructor() {
    super();
    this.settingStorage = SettingStorage.getDefault();
    this.themeManager = ThemeManager.getDefault();
    ipcMain.on(ThemeService.channel, this.channelIncomeHandler.bind(this));
    this.settingStorage.on('change', this.handleSettingChange);
  }

  /**
   * @returns {ThemeService}
   */
  static getService() {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }

    return ThemeService.instance;
  }

  /**
   * Get renderer response channel
   * @param {string} name
   */
  responseChannel(name) {
    return ThemeService.channel + `:${name}`;
  }

  /**
   * Handle setting changes
   */
  handleSettingChange(newSettings, oldSettings) {
    if (newSettings.singleUserMode !== oldSettings.singleUserMode) {
      try {
        this.sendDataToWindow(
          this.responseChannel('reload'),
          {
            cssFile: this.themeManager.getThemeCssFile(newSettings.singleUserMode)
          }
        );
      } catch (e) {
        debug.log(e);
      }
    }
  }

  loadThemeAction() {
    try {
      this.sendDataToWindow(
        this.responseChannel('load'),
        {
          cssFile: this.themeManager.getThemeCssFile(this.settingStorage.getSetting('singleUserMode'))
        }
      );
    } catch (e) {
      debug.log(e);
    }
  }

  /**
   * Reload theme action
   * @returns {void}
   */
  reloadThemeAction() {
    try {
      this.sendDataToWindow(
        this.responseChannel('reload'),
        {
          cssFile: this.themeManager.getThemeCssFile(this.settingStorage.getSetting('singleUserMode'))
        }
      );
    } catch (e) {
      debug.log(e);
    }
  }

  /**
   * Open theme file
   */
  openThemeFileAction() {
    shell.openItem(this.themeManager.getThemeCssFile(this.settingStorage.getSetting('singleUserMode')));
  }
}

export default ThemeService;
