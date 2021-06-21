import Exposer from '@/modules/Exposer';
import { app } from 'electron';
import { isDev } from '@/env';
import path from 'path';

let getPath = {
  userData() {
    return app.getPath('userData');
  },

  installation() {
    return isDev ? path.join(app.getAppPath(), '..', 'fake_installation') :
                   path.join(app.getAppPath(), '../..');
  }
}

Exposer.expose('omina.utils.getPath', getPath);

console.log(global);

export default getPath;
