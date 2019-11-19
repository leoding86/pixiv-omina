import BaseService from '@/services/BaseService';

class PartitionService extends BaseService {
  constructor() {
    super();

    this.partitions = new Map();
  }

  /**
   * @type {PartitionService}
   */
  static instance;

  static getService() {
    if (!PartitionService.instance) {
      PartitionService.instance = new PartitionService();
    }

    return PartitionService.instance;
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

    Error(`Invalid partition ${name}`);
  }
}

export default PartitionService;
