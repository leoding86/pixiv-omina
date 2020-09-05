import Request from '@/modules/Request';
import BaseProvider from './BaseProvider';

class EpisodeProvider extends BaseProvider {

  /**
   *
   * @param {Object} options
   * @param {string} options.url
   * @param {{id:string|number, workId:null|string|number}} options.context
   */
  constructor({ url, context }) {
    super({ url, context });
  }

  /**
   *
   * @param {Object} options
   * @param {string} [options.url=null]
   * @param {{id:string|number, workId:null|string|number}} options.context
   */
  static createProvider({ url = null, context }) {
    if (url === null && context.id) {
      url = EpisodeProvider.getEpisodeUrl(context.id);
    }

    return new EpisodeProvider({ url, context });
  }

  get id() {
    return [this.providerName, 'episode', this.context.id].join(':');
  }

  static getEpisodeUrl(id) {
    return `https://comic.pixiv.net/viewer/stories/${id}`;
  }

  getEpisodeDataUrl() {
    return `https://comic.pixiv.net/api/app/episodes/${this.context.id}/read`;
  }

  getWorkDataUrl() {
    return `https://comic.pixiv.net/api/app/works/v3/${this.context.workId}`;
  }

  requestEpisodeData() {
    return new Promise((resolve, reject) => {
      this.request = new Request({
        url: this.getEpisodeDataUrl(),
        method: 'GET'
      });

      this.request.setHeader('x-referer', this.url);

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

            if (jsonData && jsonData.data && jsonData.data.reading_episode && jsonData.data.reading_episode.pages) {
              this.context.workId = jsonData.data.reading_episode.work_id;
              this.context.workTitle = jsonData.data.reading_episode.work_title;
              this.context.numberTitle = jsonData.data.reading_episode.numbering_title;
              this.context.subTitle = jsonData.data.reading_episode.sub_title;
              this.context.episodeTitle = jsonData.data.reading_episode.title;
              this.context.title = jsonData.data.reading_episode.title;
              this.context.pages = jsonData.data.reading_episode.pages;

              if (this.context.userName) {
                resolve(this.context);
              } else {
                resolve(this.requestWorkData());
              }
            } else {
              reject(Error('cannot resolve episode data'));
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

  requestWorkData() {
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

            if (jsonData && jsonData.data && jsonData.data.official_work) {
              this.context.userName = jsonData.data.official_work.author;
              resolve(this.context);
            } else {
              reject(Error('cannot resolve episode data'));
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
}

export default EpisodeProvider;
