import DebugService from '@/services/DebugService';
import Exposer from '@/modules/Exposer';
import md5 from 'md5';
import { parse } from 'node-html-parser';

const debug = DebugService.getService();

Exposer.expose('omina.utils.parse', parse);
Exposer.expose('omina.utils.md5', md5);

export { debug };
