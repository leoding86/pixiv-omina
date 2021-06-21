class FormatName {
  static specials = {
    win: {//
      illegals: [
        '<', '>', ':', '"', '/', '\\', '|', '?', '*'
      ],
      /**
      illegalNames: [
        "con","aux","nul","prn","com0","com1","com2","com3","com4","com5","com6","com7","com8","com9","lpt0","lpt1","lpt2","lpt3","lpt4","lpt5","lpt6","lpt7","lpt8","lpt9"
      ],
      */
      max: 200 // full path limitation is 258
    },
    linux: {
      illegals: [
        '/', /** not suggest to use */ '@', '#', '$', '&', '\'',
      ],
      max: 256
    },
    unix: {
      illegals: [
        '/', ' '
      ],
      max: 256
    }
  }

  static getIllegalChars() {
    return FormatName.specials.win.illegals.concat(FormatName.specials.linux.illegals, FormatName.specials.unix.illegals, ['~']);
  }

  /**
   *
   * @param {String} str
   * @param {Array} skipChars
   */
  static replaceIllegalChars(str, skipChars) {
    str += '';

    FormatName.getIllegalChars().forEach(char => {
      if (skipChars && skipChars.indexOf(char) > -1) return;

      while (str.indexOf(char) > -1) {
        str = str.replace(char, '_');
      }
    });

    return str;
  }

  static format(renameFormat, context, fallback, extra = {}) {
    let filename = '';

    function getContextMetaValue(context, key) {
      var metas = {
        id: {
          key: 'illustId',
          possibleKeys: ['illustId', 'novelId', 'id']
        },
        title: {
          key: 'illustTitle',
          possibleKeys: ['illustTitle', 'novelTitle', 'title']
        },
        user_name: {
          key: 'userName',
          possibleKeys: ['userName', 'illustAuthor']
        },
        user_id: {
          key: 'userId',
          possibleKeys: ['userId', 'illustAuthorId']
        },
        page_num: {
          key: 'pageNum',
          possibleKeys: ['pageNum']
        },
        year: {
          key: 'year',
          possibleKeys: ['year']
        },
        month: {
          key: 'month',
          possibleKeys: ['month']
        },
        day: {
          key: 'day',
          possibleKeys: ['day']
        },
        number_title: {
          key: 'numberTitle',
          possibleKeys: ['numberTitle']
        },
        sub_title: {
          key: 'subTitle',
          possibleKeys: ['subTitle']
        },
        work_id: {
          key: 'workId',
          possibleKeys: ['workId']
        },
        work_title: {
          key: 'workTitle',
          possibleKeys: ['workTitle']
        }
      };

      let meta = metas[key];

      if (!meta) {
        return;
      }

      var keys = meta.possibleKeys;

      for (var i = 0, l = keys.length; i < l; i++) {
        if (context[keys[i]] !== undefined) {
          return context[keys[i]];
        }
      }

      return 'undefined';
    }

    if (!renameFormat) {
      filename = FormatName.replaceIllegalChars(fallback) + '';
    } else {
      var matches = renameFormat.match(/%[a-z_]+%/ig);
      var name = renameFormat;

      if (matches && matches.length > 0) {
        matches.forEach(function (match) {
          var key = match.slice(1, -1);
          var val = FormatName.replaceIllegalChars(getContextMetaValue(context, key));

          if (val !== undefined) {
            name = name.replace(match, val);
          }
        });
      }

      filename = !!name ? name : fallback;
    }

    filename = FormatName.replaceIllegalChars(filename, extra.mode === 'folder' ? ['/'] : '');

    /**
     * Remove dots at end of the filename
     */
    filename = filename.replace(/\.*$/, '');

    filename = filename.substr(0, FormatName.specials.win.max);

    return filename.length === 0 ? `file_${Date.now()}` : filename;
  }
}

export default FormatName;
