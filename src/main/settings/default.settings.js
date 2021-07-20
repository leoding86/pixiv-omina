import { app } from 'electron';

function defaultSetting() {
  return {
    saveTo: app.getPath('downloads'),

    illustrationRename: '%id%_%title%/p%page_num%',
    illustrationImageRename: '%id%_p%page_num%',

    mangaRename: '%id%_%title%/p%page_num%',
    mangaImageRename: '%id%_p%page_num%',

    ugoiraRename: '%id%_%title%',

    novelRename: '%id%_%title%',

    pixivComicWorkRename: '%user_name%/%work_id%_%work_title%/%number_title%%sub_title%/p%page_num%',

    overwriteMode: 'skip',

    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3964.0 Safari/537.36',

    enableProxy: false,

    proxyService: '',

    proxyServicePort: '',

    enableProxyAuth: false,

    proxyUsername: '',

    proxyPassword: '',

    closeToTray: false,

    showNotification: true,

    saveToSubDir: true,

    saveUgoiraInSubfolder: true,

    saveIllustrationInSubfolder: true,

    saveIllustrationToLocation: '',

    saveUgoiraToLocation: '',

    saveMangaToLocation: '',

    locale: 'en',

    autostartDownload: true,

    convertUgoiraToGif: true,

    singleUserMode: false,

    gifConvertWorkers: 3
  }
}

export default defaultSetting();
