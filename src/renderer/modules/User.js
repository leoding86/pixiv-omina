import UrlBuilder from '@/../utils/UrlBuilder';

class User {
  constructor() {
    //
  }

  static checkLogin() {
    return new Promise((resolve, reject) => {
      let url = UrlBuilder.getAccountUnreadCountUrl();

      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);

      xhr.timeout = 5000;

      xhr.onload = (e) => {
        let json = JSON.parse(xhr.responseText);

        if (json && json.body && json.body.unread_count) {
          resolve();
          return;
        }

        reject();
      }

      xhr.ontimeout = () => {
        reject();
      }

      xhr.onerror = () => {
        reject();
      }

      xhr.abort = () => {
        reject();
      }

      xhr.send();
    });
  }
}

export default User;
