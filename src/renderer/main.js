'use strict';

const url = window.location.href;

const matches = url.match(/target=(.+)$/)

let name;

window.app;

if (matches[1]) {
  name = matches[1].slice(0, 1).toUpperCase() + matches[1].slice(1);
}

import(
  /* webpackInclude: /Entry\.js$/ */
  `./${name}Entry`
).then(({ default: Entry}) => {
  let entry = new Entry();
  window.app = entry.app;
});
