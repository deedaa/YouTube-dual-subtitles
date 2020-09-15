const nativeOpen = XMLHttpRequest.prototype.open;
const nativeSend = XMLHttpRequest.prototype.send;
const url = 'www.youtube.com/api/timedtext';

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
  if (this._url.includes(url)) {
    const u = new URL(this._url);
    const lang = u.searchParams.get('lang');
    const v = u.searchParams.get('v');

    const selectLangCode = JSON.parse(localStorage.getItem('selectLangCode'));
    const autoLangCode = JSON.parse(localStorage.getItem('autoLangCode'));
    const langArg = selectLangCode || autoLangCode;
    console.log({ selectLangCode, autoLangCode, langArg });

    if (!langArg.includes(lang)) {
      let original = {};
      let local = {};
      let mergeLang = {};
      // 单字幕
      const singleStatus = JSON.parse(localStorage.getItem('singleStatus'));

      if (singleStatus) {
        local = await fetch(`https://www.youtube.com/api/timedtext?type=list&v=${v}`)
          .then(response => response.text())
          .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
          .then(data => {
            const list = [...data.querySelectorAll('track')].map(v => ({
              name: v.getAttribute('name'),
              lang_code: v.getAttribute('lang_code'),
            }));

            const result = list.find(v => langArg.includes(v.lang_code));

            if (result) {
              result.name ? u.searchParams.set('name', result.name) : u.searchParams.delete('name');
              u.searchParams.set('lang', result.lang_code);
              return fetch(u.toString()).then(res => res.json());
              // 优先使用已有字幕
            } else {
              return fetch(`${this._url}&tlang=${langArg[0]}`).then(res => res.json());
              // 使用自动翻译
            }
          });

        mergeLang = local;
      } else {
        [original, local] = await Promise.all([
          fetch(this._url).then(res => res.json()),
          fetch(`${this._url}&tlang=${langArg[0]}`).then(res => res.json()),
        ]);

        mergeLang = finishing(original);
        mergeLang.events.forEach((v, i) => (v.segs[0].utf8 += `\n${local.events[i].segs[0].utf8}`));
      }

      this.addEventListener('readystatechange', () => {
        if (this.readyState == 3 && this.status == 200) {
          Object.defineProperty(this, 'responseText', { value: JSON.stringify(mergeLang) });
        }
      });
    }

    console.log('拦截');
  }

  nativeSend.apply(this, arguments);
};

const autoTranslationList = JSON.parse(ytplayer.config.args.player_response).captions.playerCaptionsTracklistRenderer
  .translationLanguages;

localStorage.setItem('autoTranslationList', JSON.stringify(autoTranslationList));
// XMLHttpRequest.prototype.open = proxiedOpen;
// XMLHttpRequest.prototype.send = proxiedSend;

// if (lang !== 'zh-Hans' && lang !== 'zh-CN')

// const result = list.find(v => v.lang_code === 'zh-Hans' || v.lang_code === 'zh-CN');

// if (singleStatus) {
//   mergeLang = local;
// } else {
//   mergeLang = finishing(original);
//   mergeLang.events.forEach((v, i) => (v.segs[0].utf8 += `\n${local.events[i].segs[0].utf8}`));
// }
