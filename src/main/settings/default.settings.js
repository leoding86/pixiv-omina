import { app } from 'electron';

function defaultSetting() {
  return {
    downloadPath: app.getPath('downloads'),

    illustrationRename: '',
    illustrationImageRename: '',

    mangaRename: '',
    mangaImageRename: '',

    ugoiraRename: '',

    overwriteMode: 'rename',

    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3964.0 Safari/537.36'
  }
}

export default defaultSetting();
