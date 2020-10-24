const langsRaw = [
  [
    'zh-CN',
    {
      language: 'Chinese (China)',
      UICode: 'zh-CN',
      languageCode: ['zh-Hans', 'zh-CN'],
    },
  ],
  [
    'zh-TW',
    {
      language: 'Chinese (Taiwan)',
      UICode: 'zh-TW',
      languageCode: ['zh-Hant', 'zh-TW'],
    },
  ],
  [
    'en',
    {
      language: 'English',
      UICode: 'en',
      languageCode: ['en'],
    },
  ],
  [
    'en-GB',
    {
      language: 'English (Great Britain)',
      UICode: 'en-GB',
      languageCode: ['en', 'en-GB'],
    },
  ],
  [
    'en-US',
    {
      language: 'English (USA)',
      UICode: 'en-US',
      languageCode: ['en', 'en-US'],
    },
  ],
  [
    'es',
    {
      language: 'Spanish',
      UICode: 'es',
      languageCode: ['es'],
    },
  ],
  [
    'es-419',
    {
      language: 'Spanish (Latin America and Caribbean)',
      UICode: 'es-419',
      languageCode: ['es', 'es-419'],
    },
  ],
  [
    'ja',
    {
      language: 'Japanese',
      UICode: 'ja',
      languageCode: ['ja'],
    },
  ],
  [
    'ko',
    {
      language: 'Korean',
      UICode: 'ko',
      languageCode: ['ko'],
    },
  ],
  [
    'pt-BR',
    {
      language: 'Portuguese (Brazil)',
      UICode: 'pt-BR',
      languageCode: ['pt', 'pt-BR'],
    },
  ],
  [
    'pt-PT',
    {
      language: 'Portuguese (Portugal)',
      UICode: 'pt-PT',
      languageCode: ['pt', 'pt-PT'],
    },
  ],
  [
    'fr',
    {
      language: 'French',
      UICode: 'fr',
      languageCode: ['fr'],
    },
  ],
  [
    'ar',
    {
      language: 'Arabic',
      UICode: 'ar',
      languageCode: ['ar'],
    },
  ],
  [
    'am',
    {
      language: 'Amharic',
      UICode: 'am',
      languageCode: ['am'],
    },
  ],
  [
    'bg',
    {
      language: 'Bulgarian',
      UICode: 'bg',
      languageCode: ['bg'],
    },
  ],
  [
    'bn',
    {
      language: 'Bengali',
      UICode: 'bn',
      languageCode: ['bn'],
    },
  ],
  [
    'ca',
    {
      language: 'Catalan',
      UICode: 'ca',
      languageCode: ['ca'],
    },
  ],
  [
    'cs',
    {
      language: 'Czech',
      UICode: 'cs',
      languageCode: ['cs'],
    },
  ],
  [
    'da',
    {
      language: 'Danish',
      UICode: 'da',
      languageCode: ['da'],
    },
  ],
  [
    'de',
    {
      language: 'German',
      UICode: 'de',
      languageCode: ['de'],
    },
  ],
  [
    'el',
    {
      language: 'Greek',
      UICode: 'el',
      languageCode: ['el'],
    },
  ],
  [
    'et',
    {
      language: 'Estonian',
      UICode: 'et',
      languageCode: ['et'],
    },
  ],
  [
    'fa',
    {
      language: 'Persian',
      UICode: 'fa',
      languageCode: ['fa'],
    },
  ],
  [
    'fi',
    {
      language: 'Finnish',
      UICode: 'fi',
      languageCode: ['fi'],
    },
  ],
  [
    'fil',
    {
      language: 'Filipino',
      UICode: 'fil',
      languageCode: ['fil'],
    },
  ],
  [
    'gu',
    {
      language: 'Gujarati',
      UICode: 'gu',
      languageCode: ['gu'],
    },
  ],
  [
    'he',
    {
      language: 'Hebrew',
      UICode: 'he',
      languageCode: ['iw'],
    },
  ],
  [
    'hi',
    {
      language: 'Hindi',
      UICode: 'hi',
      languageCode: ['hi'],
    },
  ],
  [
    'hr',
    {
      language: 'Croatian',
      UICode: 'hr',
      languageCode: ['hr'],
    },
  ],
  [
    'hu',
    {
      language: 'Hungarian',
      UICode: 'hu',
      languageCode: ['hu'],
    },
  ],
  [
    'id',
    {
      language: 'Indonesian',
      UICode: 'id',
      languageCode: ['id'],
    },
  ],
  [
    'it',
    {
      language: 'Italian',
      UICode: 'it',
      languageCode: ['it'],
    },
  ],
  [
    'kn',
    {
      language: 'Kannada',
      UICode: 'kn',
      languageCode: ['kn'],
    },
  ],
  [
    'lt',
    {
      language: 'Lithuanian',
      UICode: 'lt',
      languageCode: ['lt'],
    },
  ],
  [
    'lv',
    {
      language: 'Latvian',
      UICode: 'lv',
      languageCode: ['lv'],
    },
  ],
  [
    'ml',
    {
      language: 'Malayalam',
      UICode: 'ml',
      languageCode: ['ml'],
    },
  ],
  [
    'mr',
    {
      language: 'Marathi',
      UICode: 'mr',
      languageCode: ['mr'],
    },
  ],
  [
    'ms',
    {
      language: 'Malay',
      UICode: 'ms',
      languageCode: ['ms'],
    },
  ],
  [
    'nl',
    {
      language: 'Dutch',
      UICode: 'nl',
      languageCode: ['nl'],
    },
  ],
  [
    'no',
    {
      language: 'Norwegian',
      UICode: 'no',
      languageCode: ['no'],
    },
  ],
  [
    'pl',
    {
      language: 'Polish',
      UICode: 'pl',
      languageCode: ['pl'],
    },
  ],
  [
    'ro',
    {
      language: 'Romanian',
      UICode: 'ro',
      languageCode: ['ro'],
    },
  ],
  [
    'ru',
    {
      language: 'Russian',
      UICode: 'ru',
      languageCode: ['ru'],
    },
  ],
  [
    'sk',
    {
      language: 'Slovak',
      UICode: 'sk',
      languageCode: ['sk'],
    },
  ],
  [
    'sl',
    {
      language: 'Slovenian',
      UICode: 'sl',
      languageCode: ['sl'],
    },
  ],
  [
    'sr',
    {
      language: 'Serbian',
      UICode: 'sr',
      languageCode: ['sr'],
    },
  ],
  [
    'sv',
    {
      language: 'Swedish',
      UICode: 'sv',
      languageCode: ['sv'],
    },
  ],
  [
    'sw',
    {
      language: 'Swahili',
      UICode: 'sw',
      languageCode: ['sw'],
    },
  ],
  [
    'ta',
    {
      language: 'Tamil',
      UICode: 'ta',
      languageCode: ['ta'],
    },
  ],
  [
    'te',
    {
      language: 'Telugu',
      UICode: 'te',
      languageCode: ['te'],
    },
  ],
  [
    'th',
    {
      language: 'Thai',
      UICode: 'th',
      languageCode: ['th'],
    },
  ],
  [
    'tr',
    {
      language: 'Turkish',
      UICode: 'tr',
      languageCode: ['tr'],
    },
  ],
  [
    'uk',
    {
      language: 'Ukrainian',
      UICode: 'uk',
      languageCode: ['uk'],
    },
  ],
  [
    'vi',
    {
      language: 'Vietnamese',
      UICode: 'vi',
      languageCode: ['vi'],
    },
  ],
];

const UILang = chrome.i18n.getUILanguage();
const autoLang = new Map(langsRaw).get(UILang);
// const autoLangCode = autoLang ? autoLang.languageCode : ['en'];
const autoLangCode = ['zh-Hans'];
// const autoLangCode = ['en'];
const languageParameter_ = { languageCode: autoLangCode, languageName: chrome.i18n.getMessage('auto') };

const controls = new URLSearchParams(window.location.search).get('controls') !== '0';

const injection = handler => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('constant.js');
  script.onload = handler;
  (document.head || document.documentElement).append(script);
  script.remove();
};

const injection2 = textContent => {
  const script = document.createElement('script');
  script.textContent = textContent;
  (document.head || document.documentElement).append(script);
  script.remove();
};

const audioPlay = async url => {
  const context = new AudioContext();
  var gainNode = context.createGain();

  const source = context.createBufferSource();
  const audioBuffer = await fetch(chrome.runtime.getURL(url))
    .then(res => res.arrayBuffer())
    .then(ArrayBuffer => context.decodeAudioData(ArrayBuffer));

  source.buffer = audioBuffer;

  source.connect(gainNode);
  gainNode.connect(context.destination);
  gainNode.gain.setValueAtTime(0.1, context.currentTime);
  source.start();
  // source.start(0, 0, 1);
};

// if (typeof window === 'undefined') module.exports = { langsRaw };
