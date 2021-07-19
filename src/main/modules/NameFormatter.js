import Exposer from "./Exposer";

/**
 * @typedef MetaConfig
 * @property {string} key
 * @property {string[]} possibleKeys
 *
 * @typedef {Map.<string, MetaConfig>} MetaMap
 */
class NameFormatter {
  /**
   * @type {string[]}
   */
  static illegalChars = [
    '<', '>', ':', '"', '/', '\\', '|', '?', '*',
    /** not suggest to use */ '@', '#', '$', '&', '\''
  ];

  static illegalNames = [
    "con", "aux", "nul", "prn",
    "com0", "com1", "com2", "com3", "com4", "com5", "com6", "com7", "com8", "com9",
    "lpt0", "lpt1", "lpt2", "lpt3", "lpt4", "lpt5", "lpt6", "lpt7", "lpt8", "lpt9"
  ];

  /**
   * @type {number}
   */
  static maxLength = 200;

  /**
   * @constructor
   */
  constructor() {
    /**
     * @type {MetaMap}
     */
    this.metaMap = new Map();
  }

  /**
   *
   * @param {object} metaMap
   */
  static create(metaMap) {
    let nameFormatter = new NameFormatter();

    Object.keys(metaMap).forEach(key => {
      nameFormatter.updateMetaMap(key, metaMap[key]);
    });

    return nameFormatter;
  }

  /**
   *
   * @param {MetaMap} metaMap
   * @returns {this}
   */
  setMetaMap(metaMap) {
    this.metaMap = metaMap;
    return this;
  }

  /**
   *
   * @param {string} meta
   * @param {MetaConfig} metaConfig
   * @returns {this}
   */
  updateMetaMap(meta, metaConfig) {
    this.metaMap.set(meta, metaConfig);
    return this;
  }

  /**
   *
   * @param {string} str
   * @param {string[]} skipChars
   */
  replaceIllegalChars(str, skipChars = []) {
    str += ''; // Make sure the str is a string type

    NameFormatter.illegalChars.forEach(char => {
      /**
       * Skip some chars
       */
      if (skipChars && skipChars.indexOf(char) > -1) {
        return;
      }

      while (str.indexOf(char) > -1) {
        str = str.replace(char, '_');
      }
    });

    return str;
  }

  /**
   *
   * @param {string} str
   * @returns {string}
   */
  replaceIllegalNames(str) {
    let parts = str.split('/');

    parts.forEach((part, i) => {
      if (NameFormatter.illegalNames.indexOf(part) >= 0) {
        parts[i] = part + '_';
      }
    })

    return parts.join('/');
  }

  /**
   *
   * @param {object} context
   * @param {string} meta
   * @returns {string}
   */
  getMetaValue(context, meta) {
    let metaConfig = this.metaMap.get(meta);

    if (metaConfig && Array.isArray(metaConfig.possibleKeys)) {
      for (let i = 0; i < metaConfig.possibleKeys.length; i++) {
        if (metaConfig.possibleKeys[i] in context) {
          return context[metaConfig.possibleKeys[i]];
        }
      }
    }

    return 'undefined';
  }

  /**
   *
   * @param {string} renameFormat
   * @param {object} context
   * @param {string} fallback
   * @param {{mode: string}} extra
   * @returns {string}
   */
  formatName(renameFormat, context, fallback, extra = {}) {
    let matches = renameFormat.match(/%[a-z_]+%/ig),
        name = renameFormat,
        filename = '';

    if (matches && matches.length > 0) {
      matches.forEach(match => {
        let meta = match.slice(1, -1),
            val = this.replaceIllegalChars(this.getMetaValue(context, meta));

        if (val !== undefined) {
          name = name.replace(match, val);
        }
      });
    }

    filename = !!name ? name : fallback;

    filename = this.replaceIllegalChars(filename, extra.mode === 'folder' ? ['/'] : []);

    return this.replaceIllegalNames(filename);
  }
}

Exposer.expose('omina.NameFormatter', NameFormatter);

export default NameFormatter;
