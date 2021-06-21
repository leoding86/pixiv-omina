export default class Exposer {
  /**
   * Export target to specified global property
   * @param {String} key
   * @param {*} target
   */
  static expose(key, target) {
    let properties = key.split('.'),
        scope = global;

    properties.forEach((property, index) => {
      if (scope[property] === undefined) {
        scope[property] = (index + 1) === properties.length ? target : {};
      }

      scope = scope[property];
    });
  }
}
