const fs = require('fs');
const { Translate } = require('@google-cloud/translate').v2;
const { key } = require('./key');
const rimraf = require('rimraf');
const { langsRaw } = require('./langs');
const translate = new Translate({ key });

// automatic
// Auto
const loca2 = [
  'YouTube™ dual subtitles',
  'YouTube™ dual subtitles and automatic switching to local language.',
  'Single subtitle',
  'Default subtitles',
  'Automatic',
  'Feedback',
  'Learn More',
  'No subtitles found',
];

rimraf.sync('./_locales');
rimraf.sync('./log.md');
fs.mkdirSync('./_locales');

const langList = new Map(langsRaw);
/* from: 'en', */

(async () => {
  for (const [key] of langList) {
    await translate
      .translate(loca2, { to: key })
      .then(([translation]) => {
        const obj = {};
        obj.name = { message: translation[0] };
        obj.description = { message: translation[1] };
        obj.singleSubtitle = { message: translation[2] };
        obj.defaultSubtitles = { message: translation[3] };
        obj.auto = { message: translation[4] };
        obj.feedback = { message: translation[5] };
        obj.learnMore = { message: translation[6] };
        obj.goBack = { message: translation[7] };

        const createFolder = `./_locales/${key.replace('-', '_')}`;
        fs.mkdirSync(createFolder);
        fs.writeFileSync(`${createFolder}/messages.json`, JSON.stringify(obj, null, '  '));
        console.log('obj');
      })
      .catch(error => {
        fs.appendFileSync('./log.md', `${error} => ${key}\n\n`);
        console.log('err');
      });
  }

  console.log('writeFile end');
  const complete = fs.readdirSync('./_locales').every(file => {
    const content = fs.readFileSync(`./_locales/${file}/messages.json`, 'utf8');
    return content.split('\n').length === 26;
  });

  console.log('complete =>', complete);
})();
