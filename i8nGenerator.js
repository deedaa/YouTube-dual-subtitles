// 测试当前字幕
const fs = require('fs');
const { Translate } = require('@google-cloud/translate').v2;
const rimraf = require('rimraf');
const { langsRaw } = require('./langs');

const loca = [
  ['name', 'YouTube dual subtitles'],
  ['description', 'YouTube dual subtitles and automatic switching to local language.'],
  ['singleSubtitle', 'Single subtitle'],
  ['defaultSubtitles', 'Default subtitles'],
  ['auto', 'Auto'],
  ['feedback', 'Feedback'],
  ['learnMore', 'Learn More'],
];

rimraf.sync('./log.md');
rimraf.sync('./_locales');
fs.mkdirSync('./_locales');

const langList = new Map(langsRaw);
let lastTime = 0;

langList.forEach(async (value, key) => {
  let acc = {};

  for ([k, v] of loca) {
    lastTime += 30;

    try {
      const [translation] = await translate.translate(v, { from: 'en', to: key });

      Object.assign(acc, { [k]: { message: translation } });
    } catch (error) {
      fs.appendFile('./log.md', `${error}: ${key}\n\n`, () => console.log('err'));
      return;
    }
  }

  const createFolder = `./_locales/${key.replace('-', '_')}`;
  fs.mkdirSync(createFolder);
  fs.writeFile(`${createFolder}/messages.json`, JSON.stringify(acc, null, '  '), console.log);
  console.log('acc: ', JSON.stringify(acc));
});

// const translation = await new Promise(res => setTimeout(res, lastTime)).then(async () => {
//   const [translation] = await translate.translate(v, { from: 'en', to: key });
//   return translation;
// });
