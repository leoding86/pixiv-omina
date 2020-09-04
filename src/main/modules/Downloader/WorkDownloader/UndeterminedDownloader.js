import DownloadManager from '@/modules/Downloader/DownloadManager';
import IllustrationDownloader from '@/modules/Downloader/WorkDownloader/IllustrationDownloader';
import MangaDownloader from '@/modules/Downloader/WorkDownloader/MangaDownloader';
import UgoiraDownloader from '@/modules/Downloader/WorkDownloader/UgoiraDownloader';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import {
  PixivUserProvider,
  PixivGeneralArtworkProvider,
  PixivIllustrationProvider,
  PixivMangaProvider,
  PixivUgoiraProvider
} from '@/modules/Downloader/Providers';

/**
 * It's a special downloader is used for get real downloader like illustration/manga/ugoira downloader
 * @class
 */
class UndeterminedDownloader extends WorkDownloader {

  /**
   * @constructor
   */
  constructor() {
    super();

    this.downloadManager = DownloadManager.getManager();
  }

  /**
   * @param {Object} param
   * @param {number|string} param.provider
   * @param {Object} param.options
   * @returns {WorkDownloader}
   */
  static createDownloader({provider, options}) {
    let downloader = new UndeterminedDownloader();

    downloader.provider = provider;
    downloader.url = downloader.provider.url;
    downloader.id = downloader.provider.id;
    downloader.options = Object.assign({}, options);

    return downloader;
  }

  /**
   * @override
   * @returns {void}
   */
  start() {
    this.setDownloading('resolving downloader');

    if (this.provider instanceof PixivUserProvider) {
      this.provider.requestAllWorks().then(workIds => {
        let downloaders = [];
        workIds.forEach(id => {
          downloaders.push(UndeterminedDownloader.createDownloader({
            provider: PixivGeneralArtworkProvider.createProvider({
              url: this.provider.getArtworkUrl(id),
              context: {
                id
              }
            }),
            options: this.options
          }))
        });
        this.willRecycle();
        this.setFinish();
        this.downloadManager.addDownloaders(downloaders, { replace: this });
      }).catch(error => {
        this.setError(error);
      });
    } else if (this.provider instanceof PixivGeneralArtworkProvider) {
      this.provider.requestInfo().then(context => {
        let downloader;

        if (context.illustType === 0) {
          downloader = IllustrationDownloader.createDownloader({
            provider: PixivIllustrationProvider.createProvider({ url: this.provider.url, context }),
            options: this.options
          })
        } else if (context.illustType === 1) {
          downloader = MangaDownloader.createDownloader({
            provider: PixivMangaProvider.createProvider({ url: this.provider. url,context }),
            options: this.options
          });
        } else if (context.illustType === 2) {
          downloader = UgoiraDownloader.createDownloader({
            provider: PixivUgoiraProvider.createProvider({ url: this.provider, context }),
            options: this.options
          });
        } else {
          this.setError(Error(`unsupported work type '${context.illustType}'`));
          return;
        }

        this.willRecycle();
        this.setFinish();
        this.downloadManager.transformWorkDownloader(downloader);
      }).catch(error => {
        this.setError(error);
      })
    } else {
      this.setError(Error('Unkown download provider'));
    }
  }

  reset() {
    // ignore but must have it
  }
}

export default UndeterminedDownloader;
