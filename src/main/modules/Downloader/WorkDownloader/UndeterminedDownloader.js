import { debug } from '@/global';
import DownloadManager from '@/modules/Downloader/DownloadManager';
import IllustrationDownloader from '@/modules/Downloader/WorkDownloader/IllustrationDownloader';
import MangaDownloader from '@/modules/Downloader/WorkDownloader/MangaDownloader';
import UgoiraDownloader from '@/modules/Downloader/WorkDownloader/UgoiraDownloader';
import PixivNovelDownloader from '@/modules/Downloader/WorkDownloader/Pixiv/NovelDownloader';
import WorkDownloader from '@/modules/Downloader/WorkDownloader';
import PixivComicEpisodeDownloader from '@/modules/Downloader/WorkDownloader/PixivComic/EpisodeDownloader';
import {
  PixivBookmarkProvider,
  PixivUserProvider,
  PixivGeneralArtworkProvider,
  PixivIllustrationProvider,
  PixivMangaProvider,
  PixivUgoiraProvider,
  PixivComicEpisodeProvider,
  PixivComicWorkProvider,
  PixivNovelProvider
} from '@/modules/Downloader/Providers';

/**
 * @typedef {Object} UndetermindDownloaderOptions
 * @property {String} saveTo
 * @property {Object} acceptTypes
 * @property {Boolean} [acceptTypes.ugoira=true]
 * @property {Boolean} [acceptTypes.illustration=true]
 * @property {Boolean} [acceptTypes.manga=true]
 */

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

    /**
     * @type {UndetermindDownloaderOptions}
     */
    this.options;

    this.downloadManager = DownloadManager.getManager();
  }

  /**
   * @param {Object} param
   * @param {number|string} param.provider
   * @param {UndetermindDownloaderOptions} param.options
   * @returns {WorkDownloader}
   */
  static createDownloader({provider, options}) {
    let downloader = new UndeterminedDownloader();

    downloader.provider = provider;
    downloader.url = downloader.provider.url;
    downloader.id = downloader.provider.id;
    downloader.options = Object.assign({
      acceptTypes: {
        ugoira: true,
        illustration: true,
        manga: true
      }
    }, options);

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

        this.setFinish();
        this.downloadManager.addDownloaders(downloaders, { replace: this });
      }).catch(error => {
        this.setError(error);
      });
    } else if (this.provider instanceof PixivBookmarkProvider) {
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

        this.setFinish();
        this.downloadManager.addDownloaders(downloaders, { replace: this });
      }).catch(error => {
        this.setError(error);
      });
    } else if (this.provider instanceof PixivNovelProvider) {
      this.provider.requestNovel().then(context => {
        this.downloadManager.transformWorkDownloader(PixivNovelDownloader.createDownloader({
          provider: this.provider,
          options: this.options
        }));
      });
    } else if (this.provider instanceof PixivGeneralArtworkProvider) {
      this.provider.requestInfo().then(context => {
        let downloader;

        if (context.illustType === 0) {
          if (this.options.acceptTypes.illustration) {
            downloader = IllustrationDownloader.createDownloader({
              provider: PixivIllustrationProvider.createProvider({ url: this.provider.url, context }),
              options: this.options
            })
          } else {
            debug.sendStatus(`Download is deleted because it isn't accepted type which is illustration type`);
            this.downloadManager.deleteWorkDownloader({ downloadId: this.id });
            return;
          }
        } else if (context.illustType === 1) {
          if (this.options.acceptTypes.manga) {
            downloader = MangaDownloader.createDownloader({
              provider: PixivMangaProvider.createProvider({ url: this.provider.url, context }),
              options: this.options
            });
          } else {
            debug.sendStatus(`Download is deleted because it isn't accepted type which is manga type`);
            this.downloadManager.deleteWorkDownloader({ downloadId: this.id });
            return;
          }
        } else if (context.illustType === 2) {
          if (this.options.acceptTypes.ugoira) {
            downloader = UgoiraDownloader.createDownloader({
              provider: PixivUgoiraProvider.createProvider({ url: this.provider.url, context }),
              options: this.options
            });
          } else {
            debug.sendStatus(`Download is deleted because it isn't accepted type which is ugoira type`);
            this.downloadManager.deleteWorkDownloader({ downloadId: this.id });
            return;
          }
        } else {
          this.setError(Error(`unsupported work type '${context.illustType}'`));
          return;
        }

        this.setFinish();
        this.downloadManager.transformWorkDownloader(downloader);
      }).catch(error => {
        this.setError(error);
      })
    } else if (this.provider instanceof PixivComicEpisodeProvider) {
      this.setFinish();
      this.downloadManager.transformWorkDownloader(PixivComicEpisodeDownloader.createDownloader({
        provider: this.provider,
        options: this.options
      }));
    } else if (this.provider instanceof PixivComicWorkProvider) {
      this.provider.requestContext().then(context => {
        let downloaders = [];

        context.episodeIds.forEach(id => {
          downloaders.push(PixivComicEpisodeDownloader.createDownloader({
            provider: PixivComicEpisodeProvider.createProvider({context: { id: id, userName: context.userName } }),
            options: this.options
          }));
        });

        this.setFinish();
        this.downloadManager.addDownloaders(downloaders, { replace: this });
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
