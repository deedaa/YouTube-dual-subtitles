// 浏览器语言与字幕语言code映射

const langMap = [{ 'zh-CN': ['zh-Hans', 'zh-CN'] }, { 'zh-TW': ['zh-Hant', 'zh-TW'] }, { en: ['en', 'en-GB'] }];

const langMap1 = [
  {
    language: 'Amharic',
    UICode: 'am',
    languageCode: ['am'],
  },
  {
    language: 'Arabic',
    UICode: 'ar',
    languageCode: ['ar'],
  },
  {
    language: 'Basque',
    UICode: 'eu',
    languageCode: ['eu'],
  },
  {
    language: 'Bengali',
    UICode: 'bn',
    languageCode: ['bn'],
  },
  {
    language: 'English (UK)',
    UICode: 'en-GB',
    languageCode: ['en-GB'],
  },
  {
    language: 'Portuguese (Brazil)',
    UICode: 'pt-BR',
    languageCode: ['pt-BR'],
  },
  {
    language: 'Bulgarian',
    UICode: 'bg',
    languageCode: ['bg'],
  },
  {
    language: 'Catalan',
    UICode: 'ca',
    languageCode: ['ca'],
  },
  {
    language: 'Cherokee',
    UICode: 'chr',
    languageCode: ['chr'],
  },
  {
    language: 'Croatian',
    UICode: 'hr',
    languageCode: ['hr'],
  },
  {
    language: 'Czech',
    UICode: 'cs',
    languageCode: ['cs'],
  },
  {
    language: 'Danish',
    UICode: 'da',
    languageCode: ['da'],
  },
  {
    language: 'Dutch',
    UICode: 'nl',
    languageCode: ['nl'],
  },
  {
    language: 'English (US)',
    UICode: 'en',
    languageCode: ['en'],
  },
  {
    language: 'Estonian',
    UICode: 'et',
    languageCode: ['et'],
  },
  {
    language: 'Filipino',
    UICode: 'fil',
    languageCode: ['fil'],
  },
  {
    language: 'Finnish',
    UICode: 'fi',
    languageCode: ['fi'],
  },
  {
    language: 'French',
    UICode: 'fr',
    languageCode: ['fr'],
  },
  {
    language: 'German',
    UICode: 'de',
    languageCode: ['de'],
  },
  {
    language: 'Greek',
    UICode: 'el',
    languageCode: ['el'],
  },
  {
    language: 'Gujarati',
    UICode: 'gu',
    languageCode: ['gu'],
  },
  {
    language: 'Hebrew',
    UICode: 'iw',
    languageCode: ['iw'],
  },
  {
    language: 'Hindi',
    UICode: 'hi',
    languageCode: ['hi'],
  },
  {
    language: 'Hungarian',
    UICode: 'hu',
    languageCode: ['hu'],
  },
  {
    language: 'Icelandic',
    UICode: 'is',
    languageCode: ['is'],
  },
  {
    language: 'Indonesian',
    UICode: 'id',
    languageCode: ['id'],
  },
  {
    language: 'Italian',
    UICode: 'it',
    languageCode: ['it'],
  },
  {
    language: 'Japanese',
    UICode: 'ja',
    languageCode: ['ja'],
  },
  {
    language: 'Kannada',
    UICode: 'kn',
    languageCode: ['kn'],
  },
  {
    language: 'Korean',
    UICode: 'ko',
    languageCode: ['ko'],
  },
  {
    language: 'Latvian',
    UICode: 'lv',
    languageCode: ['lv'],
  },
  {
    language: 'Lithuanian',
    UICode: 'lt',
    languageCode: ['lt'],
  },
  {
    language: 'Malay',
    UICode: 'ms',
    languageCode: ['ms'],
  },
  {
    language: 'Malayalam',
    UICode: 'ml',
    languageCode: ['ml'],
  },
  {
    language: 'Marathi',
    UICode: 'mr',
    languageCode: ['mr'],
  },
  {
    language: 'Norwegian',
    UICode: 'no',
    languageCode: ['no'],
  },
  {
    language: 'Polish',
    UICode: 'pl',
    languageCode: ['pl'],
  },
  {
    language: 'Portuguese (Portugal)',
    UICode: 'pt-PT',
    languageCode: ['pt-PT'],
  },
  {
    language: 'Romanian',
    UICode: 'ro',
    languageCode: ['ro'],
  },
  {
    language: 'Russian',
    UICode: 'ru',
    languageCode: ['ru'],
  },
  {
    language: 'Serbian',
    UICode: 'sr',
    languageCode: ['sr'],
  },
  {
    language: 'Chinese (PRC)',
    UICode: 'zh-CN',
    languageCode: ['zh-CN'],
  },
  {
    language: 'Slovak',
    UICode: 'sk',
    languageCode: ['sk'],
  },
  {
    language: 'Slovenian',
    UICode: 'sl',
    languageCode: ['sl'],
  },
  {
    language: 'Spanish',
    UICode: 'es',
    languageCode: ['es'],
  },
  {
    language: 'Swahili',
    UICode: 'sw',
    languageCode: ['sw'],
  },
  {
    language: 'Swedish',
    UICode: 'sv',
    languageCode: ['sv'],
  },
  {
    language: 'Tamil',
    UICode: 'ta',
    languageCode: ['ta'],
  },
  {
    language: 'Telugu',
    UICode: 'te',
    languageCode: ['te'],
  },
  {
    language: 'Thai',
    UICode: 'th',
    languageCode: ['th'],
  },
  {
    language: 'Chinese (Taiwan)',
    UICode: 'zh-TW',
    languageCode: ['zh-TW'],
  },
  {
    language: 'Turkish',
    UICode: 'tr',
    languageCode: ['tr'],
  },
  {
    language: 'Urdu',
    UICode: 'ur',
    languageCode: ['ur'],
  },
  {
    language: 'Ukrainian',
    UICode: 'uk',
    languageCode: ['uk'],
  },
  {
    language: 'Vietnamese',
    UICode: 'vi',
    languageCode: ['vi'],
  },
  {
    language: 'Welsh',
    UICode: 'cy',
    languageCode: ['cy'],
  },
];
