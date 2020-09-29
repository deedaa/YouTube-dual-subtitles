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
  this._url = arguments[1];
  nativeOpen.apply(this, arguments);
};

const proxiedSend = async function () {
  if (this._url.includes(subtitleUrl) || this._url.includes(subtitleUrl2)) {
    const u = new URL(this._url);
    const lang = u.searchParams.get('lang');

    console.log('lang: ', lang);
    const { languageCode } = JSON.parse(localStorage.getItem('languageParameter'));

    if (!languageCode.includes(lang)) {
      console.log('进入');
      let mergeLang = {};

      const singleStatus = JSON.parse(localStorage.getItem('singleStatus'));
      const html5VideoPlayer = document.querySelector('.html5-video-player');

      // 单字幕
      if (singleStatus) {
        const result = html5VideoPlayer
          .getOption('captions', 'tracklist')
          .find(v => languageCode.includes(v.languageCode));

        if (result) {
          console.log('result: ', result.languageCode);
          html5VideoPlayer.setOption('captions', 'track', { languageCode: result.languageCode });
          return;
          // 优先使用已有字幕
        } else {
          u.searchParams.set('tlang', languageCode[0]);
          mergeLang = await fetch(u.toString()).then(res => res.json());
          // 使用自动翻译
        }
      } else {
        u.searchParams.set('tlang', languageCode[0]);

        const [original, local] = await Promise.all([
          fetch(this._url).then(res => res.json()),
          fetch(u.toString()).then(res => res.json()),
        ]);

        mergeLang = finishing(original);
        mergeLang.events.forEach((v, i) => (v.segs[0].utf8 += `\n${local.events[i].segs[0].utf8}`));
      }

      this.addEventListener('readystatechange', () => {
        if (this.readyState == 3 && this.status == 200) {
          console.log('修改请求');
          Object.defineProperty(this, 'responseText', { value: JSON.stringify(mergeLang) });
        }
      });
    }

    console.log('拦截');
  }

  nativeSend.apply(this, arguments);
};

// document.querySelector('.html5-video-player').getOption('captions', 'tracklist')

// document.querySelector('.html5-video-player').setOption('captions', 'track', { languageCode: 'en' });
// document.querySelector('.html5-video-player').setOption('captions', 'reload', true);
// document.querySelector('.html5-video-player').toggleSubtitles();
// document.querySelector('.html5-video-player').stopVideo();
