import Request from '@/modules/Request';
import BaseProvider from './BaseProvider';
import EpisodeDownloader from '@/modules/Downloader/WorkDownloader/PixivComic/EpisodeDownloader';

class WorkProvider extends BaseProvider {
  /**
   *
   * @param {Object} options
   * @param {string} options.url
   * @param {{id:string|number}} options.context
   */
  constructor({ url, context }) {
    super({ url, context });

    this.provideMultipleDownloader = true;
  }

  static createProvider({ url, context }) {
    return new WorkProvider({ url, context })
  }

  get id() {
    return [this.providerName, 'episode', this.context.id].join(':');
  }

  getWorkDataUrl() {
    return `https://comic.pixiv.net/api/app/works/v3/${this.context.id}`;
  }

  requestContext() {
    return new Promise((resolve, reject) => {
      this.request = new Request({
        url: this.getWorkDataUrl(),
        method: 'GET'
      });

      this.request.on('response', response => {
        if (response.statusCode !== 200) {
          reject(Error(`request failed ${response.statusCode}`));
        } else {
          let body = '';

          response.on('data', data => {
            body += data;
          });

          response.on('end', () => {
            let jsonData = JSON.parse(body.toString());

            if (jsonData && jsonData.data && jsonData.data.official_work && jsonData.data.official_work.stories) {
              this.context.userName = jsonData.data.official_work.author;
              this.context.episodeIds = [];

              jsonData.data.official_work.stories.forEach(story => {
                if (!!story.readable) {
                  this.context.episodeIds.push(story.story.id);
                }
              });

              resolve(this.context);
            } else {
              reject(Error('cannot resolve episodes data'));
            }
          });

          response.on('error', error => {
            reject(error);
          });
        }
      });

      this.request.on('error', error => {
        reject(error);
      });

      this.request.end();
    });
  }

  /**
   * @param {Object} options
   * @returns {EpisodeDownloader[]}
   */
  getDownloaders(options) {
    return new Promise(resolve => {
      return this.requestContext().then(context => {
        let downloaders = [];

        context.episodeIds.forEach(id => {
          downloaders.push(EpisodeDownloader.createDownloader({
            provider: EpisodeDownloader.createProvider({context: { id: id, userName: context.userName } }),
            options
          }));
        });

        resolve(downloaders);
      });
    });
  }
}

export default WorkProvider;
