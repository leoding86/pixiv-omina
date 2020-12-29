import path from 'path';
import { app } from 'electron';
import { isDev } from '@/global';

export default {
  userData() {
    return app.getPath('userData');
  },

  installation() {
    return isDev ? path.join(app.getAppPath(), '..', 'fake_installation') :
                   app.getAppPath();
  }
}
