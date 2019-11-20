import { session } from 'electron';

class PartitionManager {
  constructor() {
    this.partitions = new Map();
  }

  /**
   * @type {PartitionManager}
   */
  static instance;

  static getManager() {
    if (!PartitionManager.instance) {
      PartitionManager.instance = new PartitionManager();
    }

    return PartitionManager.instance;
  }

  createPartition(name, persist = false) {
    if (typeof name !== 'string' || name.length < 1) {
      Error('Partition must be a string');
    }

    let partition = (persist ? 'persist:' : '') + name;

    if (!this.partitions.has(name)) {
      this.partitions.set(name, partition);
    }
  }

  getPartition(name) {
    if (this.partitions.has(name)) {
      return this.partitions.get(name);
    }

    throw Error(`Invalid partition ${name}`);
  }

  /**
   *
   * @param {string} name
   * @param {Electron.FromPartitionOptions} options
   * @returns {Electron.session}
   */
  getSession(name, options) {
    let partition = this.getPartition(name);

    return session.fromPartition(partition, options);
  }
}

export default PartitionManager;
