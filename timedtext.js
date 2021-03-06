const nativeOpen = XMLHttpRequest.prototype.open;
const nativeSend = XMLHttpRequest.prototype.send;

const mergeWord = lang => {
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
  if (arguments[1].includes('api/timedtext')) this._url = arguments[1];
  nativeOpen.apply(this, arguments);
};

const proxiedSend = async function () {
  if (this._url) {
    const u = new URL(this._url);
    const lang = u.searchParams.get('lang');
    const v = u.searchParams.get('v');
    const { languageCode } = JSON.parse(localStorage.getItem('languageParameter'));
    const singleStatus = JSON.parse(localStorage.getItem('singleStatus'));

    if (singleStatus) {
      const result = await fetch(`https://www.youtube.com/api/timedtext?type=list&v=${v}`)
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
        .then(data => {
          const list = [...data.querySelectorAll('track')].map(v => ({
            name: v.getAttribute('name'),
            lang_code: v.getAttribute('lang_code'),
          }));
          console.log('list: ', list);
          const result = list.find(v => languageCode.includes(v.lang_code));
          return result;
        });

      console.log('result: ', result);
      if (result) {
        result.name ? u.searchParams.set('name', result.name) : u.searchParams.delete('name');
        u.searchParams.set('lang', result.lang_code);
        // have
      } else {
        u.searchParams.set('tlang', languageCode[0]);
        // translation
      }
      const subtitles = await fetch(u.toString()).then(res => res.json());
      Object.defineProperty(this, 'responseText', { value: JSON.stringify(subtitles), writable: false });
    } else if (!languageCode.includes(lang)) {
      u.searchParams.set('tlang', languageCode[0]);

      const [original, local] = await Promise.all([
        fetch(this._url).then(res => res.json()),
        fetch(u.toString()).then(res => res.json()),
      ]);

      const localMap = new Map(local.events.map(v => [v.tStartMs, v.segs[0].utf8.trim()]));

      const subtitles = mergeWord(original);
      subtitles.events.forEach(v => {
        const localLang = localMap.get(v.tStartMs) || '';
        const originalLang = v.segs[0].utf8.trim();
        v.segs[0].utf8 = `${originalLang}\n${localLang}`.trim();
      });

      console.log('subtitles: ', subtitles);
      Object.defineProperty(this, 'responseText', { value: JSON.stringify(subtitles), writable: false });
    }
  }

  nativeSend.apply(this, arguments);
};
