'use strict';

const url = window.location.href;

const matches = url.match(/target=([^&]+)(&login_url=(?<login_url>[^&]+))?(&locale=(?<locale>[^&]+))?$/)

let name = '',
    loginUrl = null,
    locale = null;

window.app;

if (matches[1]) {
  name = matches[1].slice(0, 1).toUpperCase() + matches[1].slice(1);
}

if (matches.groups['login_url']) {
  loginUrl = decodeURIComponent(matches.groups['login_url']);
}

if (matches.groups['locale']) {
  locale = matches.groups['locale'];
}

import(
  /* webpackInclude: /Entry\.js$/ */
  `./${name}Entry`
).then(({ default: Entry}) => {
  let entry = new Entry({ loginUrl, locale });
  window.app = entry.app;
});
