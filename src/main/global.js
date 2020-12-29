import DebugService from '@/services/DebugService';

const debug = DebugService.getService();
const isDev = process.argv.indexOf('--dev') > 0;

export { debug, isDev };
