const nativeOpen = XMLHttpRequest.prototype.open;
const nativeSend = XMLHttpRequest.prototype.send;
const subtitleUrl = 'www.youtube.com/api/timedtext';
const subtitleUrl2 = 'www.youtube-nocookie.com/api/timedtext';

const finishing = lang => {
  const events = [];
  let before = null;
  let segment = '';

  lang.events.forEach((event, i) => {
    if (!event.segs) return;
    if (!before) before = event;

    if (event.dDurationMs && event.tStartMs >= before.tStartMs + before.dDurationMs) {
      events.push({
        tStartMs: before.tStartMs,
        dDurationMs: before.dDurationMs,
        segs: [{ utf8: segment.replace(/\n/g, ' ') }],
      });

      before = event;
      segment = event.segs.reduce((acc, v) => (acc += v.utf8), '');

      if (i === lang.events.length - 1) {
        events.push({
          tStartMs: before.tStartMs,
          dDurationMs: before.dDurationMs,
          segs: [{ utf8: segment.replace(/\n/g, ' ') }],
        });
      }
    } else {
      segment += event.segs.reduce((acc, v) => (acc += v.utf8), '');
    }
  });

  return {
    wireMagic: 'pb3',
    pens: [{}],
    wsWinStyles: [{}],
    wpWinPositions: [{}],
    events: events,
  };
};

const proxiedOpen = function () {
  if (arguments[1].includes(subtitleUrl) || arguments[1].includes(subtitleUrl2)) {
    this._url = arguments[1];
  }
  nativeOpen.apply(this, arguments);
};

let defaultSubtitles = '';
// localStorage.removeItem('changeTrack');

const proxiedSend = async function () {
  if (this._url) {
    const u = new URL(this._url);
    const lang = u.searchParams.get('lang');
    const { languageCode } = JSON.parse(localStorage.getItem('languageParameter'));
    const singleStatus = JSON.parse(localStorage.getItem('singleStatus'));
    console.log('lang: ', lang);

    if (!defaultSubtitles) {
      defaultSubtitles = document.querySelector('.html5-video-player').getOption('captions', 'track').languageCode;
    }
    console.log('defaultSubtitles: ', defaultSubtitles);

    if (singleStatus) {
      const videoPlayer = document.querySelector('.html5-video-player');
      const result = videoPlayer.getOption('captions', 'tracklist').find(v => languageCode.includes(v.languageCode));

      if (result) {
        console.log('result: ', result.languageCode);
        videoPlayer.setOption('captions', 'track', { languageCode: result.languageCode });
        // localStorage.setItem('changeTrack', true);
        document.querySelector('#single-button .ytp-menuitem-label').dataset.changetrack = true;
        if (lang !== result.languageCode) return;
        // 优先使用已有字幕
      } else {
        u.searchParams.set('tlang', languageCode[0]);
        const mergeLang = await fetch(u.toString()).then(res => res.json());
        Object.defineProperty(this, 'responseText', { value: JSON.stringify(mergeLang), writable: false });
        document.querySelector('#single-button .ytp-menuitem-label').dataset.changetrack = false;
        // 使用自动翻译
      }
    } else if (!languageCode.includes(lang)) {
      u.searchParams.set('tlang', languageCode[0]);

      const [original, local] = await Promise.all([
        fetch(this._url).then(res => res.json()),
        fetch(u.toString()).then(res => res.json()),
      ]);

      const aa = local.events.map(v => [v.tStartMs, v.segs[0].utf8.trim()]);
      const bb = new Map(aa);

      const mergeLang = finishing(original);
      mergeLang.events.forEach(v => {
        const localLang = bb.get(v.tStartMs) || '';
        const originalLang = v.segs[0].utf8.trim();
        // console.log('localLang: ', v.tStartMs, localLang);
        v.segs[0].utf8 = `${originalLang}\n${localLang}`.trim();
      });

      // console.log('mergeLang: ', mergeLang);
      Object.defineProperty(this, 'responseText', { value: JSON.stringify(mergeLang), writable: false });
    }

    console.log('拦截');
  }

  nativeSend.apply(this, arguments);
};

// document.querySelector('.html5-video-player').getOption('captions', 'tracklist')
// document.querySelector('.html5-video-player').getOption('captions', 'track')

// document.querySelector('.html5-video-player').setOption('captions', 'track', { languageCode: 'en' });
// document.querySelector('.html5-video-player').setOption('captions', 'reload', true);
// document.querySelector('.html5-video-player').toggleSubtitles();
// document.querySelector('.html5-video-player').stopVideo();
// document.querySelector('.html5-video-player').loadModule("captions");

// this.addEventListener('readystatechange', () => {
//   if (this.readyState == 3 && this.status == 200) {
//     console.log('修改请求');
//     Object.defineProperty(this, 'responseText', { value: JSON.stringify(mergeLang) });
//   }
// });
// const localLang = local.events[i] ? local.events[i].segs[0].utf8.trim() : '';
// console.log('original', original);
// console.log('local', local);
