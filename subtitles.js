const injection = handler => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('timedtext.js');
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

const restartSubtitles = () => {
  injection2(
    `document.querySelectorAll('.html5-video-player').forEach(element => element.setOption('captions', 'reload', true));`
  );
};

chrome.runtime.onMessage.addListener(({ status }) => {
  if (status) {
    chrome.storage.local.get(null, ({ singleStatus, languageParameter }) => {
      localStorage.setItem('languageParameter', JSON.stringify(languageParameter));
      localStorage.setItem('singleStatus', singleStatus);
      injection2(`XMLHttpRequest.prototype.open = proxiedOpen; XMLHttpRequest.prototype.send = proxiedSend;`);
      restartSubtitles();
    });
  } else {
    injection2(`XMLHttpRequest.prototype.open = nativeOpen; XMLHttpRequest.prototype.send = nativeSend;`);
    restartSubtitles();
  }

  audioPlay('assets/2.ogg');
});

chrome.storage.local.get(null, ({ status, singleStatus, languageParameter }) => {
  injection(() => {
    if (status) {
      localStorage.setItem('languageParameter', JSON.stringify(languageParameter));
      localStorage.setItem('singleStatus', singleStatus);
      injection2(`XMLHttpRequest.prototype.open = proxiedOpen; XMLHttpRequest.prototype.send = proxiedSend;`);
    }
  });
});

// chrome.storage.local.set({ languageParameter });

// console.log('status: ', status);
// injection2(`document.querySelector('#ytd-player .html5-video-player').setOption('captions', 'reload', true);`);

// ['#language-button', '#single-button'].forEach(id => document.querySelector(id).style.removeProperty('display'));
// ['#language-button', '#single-button'].forEach(id =>
//   document.querySelector(id).style.setProperty('display', 'none')
// );

// const UILang = chrome.i18n.getUILanguage();
// const autoLang = new Map(langsRaw).get(UILang);
// // const autoLangCode = autoLang ? autoLang.languageCode : ['en'];
// const autoLangCode = ['zh-Hans'];
// const languageParameter_ = { languageCode: autoLangCode, languageName: chrome.i18n.getMessage('auto') };

// const injection = handler => {
//   const script = document.createElement('script');
//   script.src = chrome.runtime.getURL('constant.js');
//   script.onload = handler;
//   (document.head || document.documentElement).append(script);
//   script.remove();
// };

// const injection2 = textContent => {
//   const script = document.createElement('script');
//   script.textContent = textContent;
//   (document.head || document.documentElement).append(script);
//   script.remove();
// };
