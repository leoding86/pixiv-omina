import NameFormatter from '@/modules/NameFormatter'

class FormatName {
  static format(renameFormat, context, fallback, extra = {}) {
    let metaMap = {
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

    let nameFormatter = NameFormatter.create(metaMap);

    return nameFormatter.formatName(renameFormat, context, fallback, extra);
  }
}

export default FormatName;
