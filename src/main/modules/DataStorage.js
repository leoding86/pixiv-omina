import path from 'path';
import fs from 'fs-extra';
import EventEmitter from 'events';
import GetPath from '@/modules/Utils/GetPath';
import Exposer from '@/modules/Exposer';

class DataStorage extends EventEmitter {
  /**
   * @type {DataStorage}
   */
  static instance;

  constructor() {
    super();

    this.rootPath = path.join(GetPath.userData(), 'data_storage');
  }

  /**
   * Get default instance of DataStorage
   * @returns {DataStorage}
   */
  static getDefault() {
    if (!DataStorage.instance) {
      DataStorage.instance = new DataStorage();
    }

    return DataStorage.instance;
  }

  /**
   * Check if the key is valid
   * @throws {Error}
   */
  checkKey(key) {
    if (/^[a-z\d_](\.[a-z\d_])+$/i.test(key)) {
      return true;
    }

    throw new Error('Invalid key: ' + key);
  }

  /**
   *
   * @param {string} key
   * @param {any} value
   * @returns {void}
   */
  setData(key, value) {
    this.checkKey(key);

    let parts = key.split('.');

    if (parts.length < 0) {
      throw new Error('Cannot create storage folder in user data folder');
    }

    parts.unshift(this.rootPath);

    let storagePath = path.join(parts);

    /**
     * Check if the process can write target file
     */
    fs.accessSync(storagePath, fs.constants.W_OK);

    /**
     * Create data file
     */
    fs.ensureFileSync(storagePath);

    fs.writeFileSync(storagePath, JSON.stringify(value));
  }

  /**
   *
   * @param {string} key
   * @returns {any}
   **/
  getData(key) {
    this.checkKey();

    let parts = key.split('.');

    if (parts.length < 0) {
      throw new Error('Cannot create storage folder in user data folder');
    }

    parts.unshift(this.rootPath);

    let storagePath = path.join(parts);

    /**
     * Check if the process can write target file
     */
    fs.accessSync(storagePath, fs.constants.R_OK);

    return JSON.parse(fs.readFileSync(storagePath));
  }
}

Exposer.expose('omina.dataStorage', DataStorage.getDefault());

export default DataStorage;
