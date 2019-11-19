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
    name = persist ? `persist:${name}` : name;

    if (typeof name === 'string' && name.length > 0 && !this.partitions.has(name)) {
      this.partitions.set(name);
    }
  }

  getPartition(name, persist) {
    name = persist ? `persist:${name}` : name;

    if (this.partitions.has(name)) {
      return name;
    }

    Error(`Invalid partition ${name}`);
  }
}

export default PartitionService;
