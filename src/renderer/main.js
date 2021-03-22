'use strict';

const url = window.location.href;

const matches = url.match(/target=([^&]+)(&login_url=([^&]+))?$/)

let name = '',
    loginUrl = '';

window.app;

if (matches[1]) {
  name = matches[1].slice(0, 1).toUpperCase() + matches[1].slice(1);
}

if (matches[3]) {
  loginUrl = decodeURIComponent(matches[3]);
}
console.log(matches);
import(
  /* webpackInclude: /Entry\.js$/ */
  `./${name}Entry`
).then(({ default: Entry}) => {
  let entry = new Entry({ loginUrl });
  window.app = entry.app;
});
