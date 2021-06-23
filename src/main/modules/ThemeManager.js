import GetPath from '@/modules/Utils/GetPath';
import fs from 'fs-extra';
import path from 'path';

export default class ThemeManager {
  static instance;

  constructor() {
    //
  }

  /**
   *
   * @returns {ThemeManager}
   */
  static getDefault() {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }

    return ThemeManager.instance;
  }

  /**
   * Get theme css file
   * @param {boolean} singleUserMode
   * @returns {string}
   * @throws {Error}
   */
  getThemeCssFile(singleUserMode) {
    let file = path.join(
      singleUserMode ? GetPath.installation() : GetPath.userData(),
      'config',
      'theme.css'
    );

    if (fs.existsSync(file) && fs.existsSync(file)) {
      return file;
    } else {
      throw new Error('Cannot file theme css file');
    }
  }
}
