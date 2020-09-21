const injection = handler => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('constant.js');
  script.onload = handler;
  (document.head || document.documentElement).append(script);
  // script.remove();
};

const injection2 = textContent => {
  const script = document.createElement('script');
  script.textContent = textContent;
  (document.head || document.documentElement).append(script);
  // script.remove();
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
  const subtitlesButton = document.querySelector('.ytp-subtitles-button.ytp-button');
  subtitlesButton.click();
  subtitlesButton.click();
};

chrome.storage.onChanged.addListener(({ status, autoLangCode }) => {
  console.log('autoLangCode:onChanged ', autoLangCode);
  if (autoLangCode) {
    document.addEventListener('DOMContentLoaded', () => {
      injection2(`
      localStorage.setItem(
        'autoTranslationList',
        JSON.stringify(window.ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer.translationLanguages)
      );
    `);
    });
  }

  if (!status) return;

  if (status.newValue) {
    injection2(`XMLHttpRequest.prototype.open = proxiedOpen; XMLHttpRequest.prototype.send = proxiedSend;`);
    insertCustomMenu()();
  } else {
    injection2(`XMLHttpRequest.prototype.open = nativeOpen; XMLHttpRequest.prototype.send = nativeSend;`);
    ['#language-button', '#single-button'].forEach(id => document.querySelector(id).remove());
    restartSubtitles();
  }

  audioPlay('assets/2.ogg');
});

const insertCustomMenu = ({ single, selectLangCode, autoLangCode, autoTranslationList_ }) => {
  if (window.self === window.top) {
    injection2(`
    localStorage.setItem(
    'autoTranslationList',
    JSON.stringify(window.ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer.translationLanguages)
    );
  `);
  } else {
    localStorage.setItem('autoTranslationList', JSON.stringify(autoTranslationList_));
    console.log('iframe中!!');
  }

  const langArg = selectLangCode || autoLangCode;
  const autoTranslationList = JSON.parse(localStorage.getItem('autoTranslationList'));
  const { languageName } = autoTranslationList.find(v => v.languageCode === langArg[0]);

  if (!autoTranslationList_.length && autoTranslationList) {
    chrome.storage.local.set({ autoTranslationList_: autoTranslationList });
    console.log('设置autoTranslationList_');
  }

  const ytpSettingsMenu = document.querySelector('.ytp-popup.ytp-settings-menu');
  const ytpPanel = ytpSettingsMenu.querySelector('.ytp-panel');
  const panelMenu = ytpSettingsMenu.querySelector('.ytp-panel-menu');
  ytpSettingsMenu.addEventListener('click', e => e.stopPropagation());

  panelMenu.insertAdjacentHTML(
    'beforeend',
    `
      <div class="ytp-menuitem" aria-haspopup="true" role="menuitem" tabindex="0" id="language-button">
        <div class="ytp-menuitem-icon"></div>
        <div class="ytp-menuitem-label">默认语言</div>
        <div class="ytp-menuitem-content">${languageName.simpleText}</div>
      </div>

      <div class="ytp-menuitem" role="menuitemcheckbox" aria-checked="${single}" tabindex="0" id="single-button">
        <div class="ytp-menuitem-icon"></div>
        <div class="ytp-menuitem-label">${chrome.i18n.getMessage('single_subtitle')}</div>
        <div class="ytp-menuitem-content">
          <div class="ytp-menuitem-toggle-checkbox"></div>
        </div>
      </div>
    `
  );

  ytpSettingsMenu.querySelector('#single-button').addEventListener('click', function () {
    chrome.storage.local.get('single', ({ single }) => {
      this.setAttribute('aria-checked', !single);
      chrome.storage.local.set({ single: !single });
      window.addEventListener('click', restartSubtitles, { once: true });
    });
  });

  const revertOrigin = e => {
    const eventType = e.type === 'blur' ? 'click' : 'blur';
    window.removeEventListener(eventType, revertOrigin);

    setTimeout(() => {
      const forward = ytpSettingsMenu.querySelector('#forward');
      forward && forward.remove();
      ytpPanel.classList.remove('ytp-panel-animate-back');
    }, 200);

    restartSubtitles();
  };

  ytpSettingsMenu.querySelector('#language-button').addEventListener('click', () => {
    const levelHeight = ytpSettingsMenu.style.getPropertyValue('height');

    const list = autoTranslationList
      .map(
        ({ languageCode, languageName }) => `
            <div class="ytp-menuitem" tabindex="0" role="menuitemradio" aria-checked=${languageCode === langArg[0]}>
              <div class="ytp-menuitem-label" data-lang="${languageCode}" data-languagename="${
          languageName.simpleText
        }">
               ${languageName.simpleText}
              </div>
            </div>`
      )
      .join('');

    let resHeight = Math.round(document.querySelector('.html5-video-player').offsetHeight * 0.7);
    resHeight = resHeight > 414 ? 414 : resHeight;

    ytpSettingsMenu.insertAdjacentHTML(
      'beforeend',
      `
        <div class="ytp-panel ytp-panel-animate-forward" id="forward" style="min-width: 250px; width: 251px; height: ${resHeight}px;">
          <div class="ytp-panel-header">
            <button class="ytp-button ytp-panel-title">默认字幕</button>
          </div>
          <div class="ytp-panel-menu" role="menu" id="languageList">
            ${list}
          </div>
        </div>
        `
    );

    ytpSettingsMenu.classList.add('ytp-popup-animating');
    ytpSettingsMenu.style.setProperty('height', `${resHeight}px`);
    [ytpSettingsMenu, ytpPanel].forEach(el => el.style.setProperty('width', `251px`));

    ytpPanel.classList.add('ytp-panel-animate-back');
    setTimeout(() => ytpSettingsMenu.querySelector('#forward').classList.remove('ytp-panel-animate-forward'), 5);
    setTimeout(() => ytpSettingsMenu.classList.remove('ytp-popup-animating'), 290);

    const defaultLevel = () => {
      ytpSettingsMenu.classList.add('ytp-popup-animating');
      ytpSettingsMenu.style.setProperty('height', levelHeight);
      [ytpSettingsMenu, ytpPanel].forEach(el => el.style.setProperty('width', `${panelMenu.offsetWidth}px`));
      ytpSettingsMenu.querySelector('#forward').classList.add('ytp-panel-animate-forward');
      ytpPanel.classList.remove('ytp-panel-animate-back');

      setTimeout(() => {
        ytpSettingsMenu.classList.remove('ytp-popup-animating');
        ytpSettingsMenu.querySelector('#forward').remove();
      }, 290);
    };

    ytpSettingsMenu
      .querySelector('.ytp-panel-header .ytp-button')
      .addEventListener('click', defaultLevel, { once: true });

    ytpSettingsMenu.querySelector('#languageList').addEventListener('click', function (e) {
      chrome.storage.local.set({ selectLangCode: [e.target.dataset.lang] }, () =>
        localStorage.setItem('selectLangCode', JSON.stringify([e.target.dataset.lang]))
      );

      [...this.children].forEach(el => el.removeAttribute('aria-checked'));
      e.target.parentElement.setAttribute('aria-checked', true);
      ytpSettingsMenu.querySelector('#language-button .ytp-menuitem-content').textContent =
        e.target.dataset.languagename;

      defaultLevel();
    });

    window.addEventListener('click', revertOrigin, { once: true });
    window.addEventListener('blur', revertOrigin, { once: true });

    [...panelMenu.children].forEach(el => el.style.setProperty('white-space', 'nowrap'));
  });

  return restartSubtitles;
};

const UILang = chrome.i18n.getUILanguage();
const autoLang = new Map(langsRaw).get(UILang);
if (autoLang) chrome.storage.local.set({ autoLangCode: autoLang.languageCode });

chrome.storage.local.get(null, function ({ status, single, selectLangCode, autoLangCode, autoTranslationList_ }) {
  localStorage.setItem('singleStatus', single);
  localStorage.setItem('selectLangCode', JSON.stringify(selectLangCode));
  localStorage.setItem('autoLangCode', JSON.stringify(autoLangCode));

  injection(() => {
    if (status) {
      injection2(`XMLHttpRequest.prototype.open = proxiedOpen; XMLHttpRequest.prototype.send = proxiedSend;`);

      if (new URLSearchParams(window.location.search).get('controls') !== '0') {
        insertCustomMenu(arguments[0]);
      }
    }
  });
});

console.log('UILang: ', UILang);
console.log('autoLang: ', autoLang);
// reboot && reboot();

// document.addEventListener('DOMContentLoaded', () => console.log('DOMContentLoaded!!'));

// document.addEventListener('DOMContentLoaded', () => insertCustomMenu());
// chrome.storage.local.get('status', ({ status }) => {
//   if (status) document.addEventListener('DOMContentLoaded', () => insertCustomMenu());
// });

// ytp-panel-animate-back ytp-panel-animate-forward (100%)

// window.addEventListener('click', () => {
//   console.log('windwos:click');
// });

// const levelWidth = ytpSettingsMenu.style.getPropertyValue('width');
// const autoTranslationList = JSON.parse(localStorage.getItem('autoTranslationList'));
// const langArg = JSON.parse(localStorage.getItem('selectLangCode')) || autoLang.languageCode;

// 每个窗口同步状态
// window.addEventListener('focus', () => {
//   chrome.storage.local.get('single', ({ single }) => {
//     document.querySelector('#single-button').setAttribute('aria-checked', single);
//   });
// });

// chrome.storage.local.get(
//   ['single', 'selectLangCode', 'autoLangCode', 'autoTranslationList_'],
//   ({ single, selectLangCode, autoLangCode, autoTranslationList_ }) => {
// }
// );
