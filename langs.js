const langs = [
  {
    language: 'Chinese (China)',
    UICode: 'zh-CN',
    languageCode: ['zh-Hans', 'zh-CN'],
  },
  {
    language: 'Chinese (Taiwan)',
    UICode: 'zh-TW',
    languageCode: ['zh-Hant', 'zh-TW'],
  },
  {
    language: 'English',
    UICode: 'en',
    languageCode: ['en'],
  },
  {
    language: 'English (Great Britain)',
    UICode: 'en-GB',
    languageCode: ['en', 'en-GB'],
  },
  {
    language: 'English (USA)',
    UICode: 'en-US',
    languageCode: ['en', 'en-US'],
  },
  {
    language: 'Spanish',
    UICode: 'es',
    languageCode: ['es'],
  },
  {
    language: 'Spanish (Latin America and Caribbean)',
    UICode: 'es-419',
    languageCode: ['es', 'es-419'],
  },
  {
    language: 'Japanese',
    UICode: 'ja',
    languageCode: ['ja'],
  },
  {
    language: 'Korean',
    UICode: 'ko',
    languageCode: ['ko'],
  },
  {
    language: 'Portuguese (Brazil)',
    UICode: 'pt-BR',
    languageCode: ['pt', 'pt-BR'],
  },
  {
    language: 'Portuguese (Portugal)',
    UICode: 'pt-PT',
    languageCode: ['pt', 'pt-PT'],
  },
  {
    language: 'French',
    UICode: 'fr',
    languageCode: ['fr'],
  },
  {
    language: 'Arabic',
    UICode: 'ar',
    languageCode: ['ar'],
  },
  {
    language: 'Amharic',
    UICode: 'am',
    languageCode: ['am'],
  },
  {
    language: 'Bulgarian',
    UICode: 'bg',
    languageCode: ['bg'],
  },
  {
    language: 'Bengali',
    UICode: 'bn',
    languageCode: ['bn'],
  },
  {
    language: 'Catalan',
    UICode: 'ca',
    languageCode: ['ca'],
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
    language: 'Estonian',
    UICode: 'et',
    languageCode: ['et'],
  },
  {
    language: 'Persian',
    UICode: 'fa',
    languageCode: ['fa'],
  },
  {
    language: 'Finnish',
    UICode: 'fi',
    languageCode: ['fi'],
  },
  {
    language: 'Filipino',
    UICode: 'fil',
    languageCode: ['fil'],
  },
  {
    language: 'Gujarati',
    UICode: 'gu',
    languageCode: ['gu'],
  },
  {
    language: 'Hebrew',
    UICode: 'he',
    languageCode: ['iw'],
  },
  {
    language: 'Hindi',
    UICode: 'hi',
    languageCode: ['hi'],
  },
  {
    language: 'Croatian',
    UICode: 'hr',
    languageCode: ['hr'],
  },
  {
    language: 'Hungarian',
    UICode: 'hu',
    languageCode: ['hu'],
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
    language: 'Kannada',
    UICode: 'kn',
    languageCode: ['kn'],
  },
  {
    language: 'Lithuanian',
    UICode: 'lt',
    languageCode: ['lt'],
  },
  {
    language: 'Latvian',
    UICode: 'lv',
    languageCode: ['lv'],
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
    language: 'Malay',
    UICode: 'ms',
    languageCode: ['ms'],
  },
  {
    language: 'Dutch',
    UICode: 'nl',
    languageCode: ['nl'],
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
    language: 'Serbian',
    UICode: 'sr',
    languageCode: ['sr'],
  },
  {
    language: 'Swedish',
    UICode: 'sv',
    languageCode: ['sv'],
  },
  {
    language: 'Swahili',
    UICode: 'sw',
    languageCode: ['sw'],
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
    language: 'Turkish',
    UICode: 'tr',
    languageCode: ['tr'],
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
];

const UILang = chrome.i18n.getUILanguage();
console.log('UILang: ', UILang);

const autoLang = langs.find(v => v.UICode === UILang);

if (autoLang) {
  chrome.storage.local.set({ autoLangCode: autoLang.languageCode }, () =>
    localStorage.setItem('autoLangCode', JSON.stringify(autoLang.languageCode))
  );
}

// || { language: 'English', UICode: 'en', languageCode: ['en'] };
