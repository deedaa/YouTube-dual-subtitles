const injection = src => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(src);
  (document.head || document.documentElement).append(script);
  return script;
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

injection('constant.js').onload = function () {
  chrome.storage.local.get('status', ({ status }) => {
    if (status) {
      injection2(`
        XMLHttpRequest.prototype.open = proxiedOpen;
        XMLHttpRequest.prototype.send = proxiedSend;
      `);
    }
  });

  // this.remove();
};

const restartSubtitles = () => {
  chrome.storage.local.get('single', ({ single }) => {
    localStorage.setItem('singleStatus', single);

    const subtitlesButton = document.querySelector('.ytp-subtitles-button.ytp-button');
    subtitlesButton.click();
    subtitlesButton.click();
  });
};

chrome.storage.onChanged.addListener(({ status }) => {
  if (!status) return;

  if (status.newValue) {
    injection2(`
      XMLHttpRequest.prototype.open = proxiedOpen;
      XMLHttpRequest.prototype.send = proxiedSend;
    `);
    insertCustomMenu();
  } else {
    injection2(`
      XMLHttpRequest.prototype.open = nativeOpen;
      XMLHttpRequest.prototype.send = nativeSend ;
    `);
    document.querySelector('#single-button').remove();
  }

  audioPlay('assets/2.ogg');

  restartSubtitles();
});

const insertCustomMenu = () => {
  chrome.storage.local.get(['single', 'selectLangCode'], ({ single, selectLangCode }) => {
    injection2(`
      const autoTranslationList = JSON.parse(ytplayer.config.args.player_response).captions.playerCaptionsTracklistRenderer
      .translationLanguages;
      console.log('autoTranslationList-99: ', autoTranslationList);
      localStorage.setItem('autoTranslationList', JSON.stringify(autoTranslationList));
    `);

    localStorage.setItem('selectLangCode', JSON.stringify(selectLangCode));
    const panelMenu = document.querySelector('.ytp-settings-menu .ytp-panel-menu');
    document.querySelector('.ytp-settings-menu').addEventListener('click', e => e.stopPropagation());

    const langArg = selectLangCode || autoLang.languageCode;
    const autoTranslationList = JSON.parse(localStorage.getItem('autoTranslationList'));
    const { languageName } = autoTranslationList.find(v => v.languageCode === langArg[0]) || {
      languageName: { simpleText: '' },
    };

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

    /* 每个窗口同步状态 */

    document.querySelector('#single-button').addEventListener('click', function () {
      chrome.storage.local.get('single', ({ single }) => {
        this.setAttribute('aria-checked', !single);
        chrome.storage.local.set({ single: !single });
        window.addEventListener('click', restartSubtitles, { once: true });
      });
    });

    document.querySelector('#language-button').addEventListener('click', () => {
      const ytpSettingsMenu = document.querySelector('.ytp-popup.ytp-settings-menu');
      const ytpPanel = document.querySelector('.ytp-settings-menu .ytp-panel');
      [...ytpPanel.children].forEach(el => el.style.setProperty('display', 'none', 'important'));
      const levelHeight = ytpSettingsMenu.style.getPropertyValue('height');
      const levelWidth = ytpSettingsMenu.style.getPropertyValue('width');

      [ytpSettingsMenu, ytpPanel].forEach(el => {
        el.style.setProperty('transition', 'height 0.3s ease-out, width 0.3s ease-out');
        el.style.setProperty('height', '366px');
        el.style.setProperty('width', '251px');
        // el.style.setProperty('overflow', 'hidden');
        el.style.setProperty('white-space', 'nowrap');
      });

      const autoTranslationList = JSON.parse(localStorage.getItem('autoTranslationList'));

      const selectLangCode = JSON.parse(localStorage.getItem('selectLangCode'));
      const langArg = selectLangCode || autoLang.languageCode;

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

      ytpPanel.insertAdjacentHTML(
        'afterbegin',
        `
        <div class="ytp-panel-header defaultLanguage">
          <button class="ytp-button ytp-panel-title">默认语言</button>
        </div>
        <div class="ytp-panel-menu defaultLanguage" role="menu" id="languageList">
          ${list}
        </div>
        `
      );

      const languageList = document.querySelector('#languageList');

      languageList.addEventListener('click', e => {
        chrome.storage.local.set({ selectLangCode: [e.target.dataset.lang] }, () =>
          localStorage.setItem('selectLangCode', JSON.stringify([e.target.dataset.lang]))
        );

        [...languageList.children].forEach(el => el.removeAttribute('aria-checked'));
        e.target.parentElement.setAttribute('aria-checked', true);
        document.querySelector('#language-button .ytp-menuitem-content').textContent = e.target.dataset.languagename;
      });

      const defaultLevel = () => {
        [ytpSettingsMenu, ytpPanel].forEach(el => {
          el.style.setProperty('height', levelHeight);
          el.style.setProperty('width', levelWidth);

          setTimeout(() => {
            el.style.removeProperty('transition');
            el.style.removeProperty('white-space');
          }, 308);
        });

        [...document.querySelectorAll('.defaultLanguage')].forEach(el => el.remove());
        [...ytpPanel.children].forEach(el => el.style.removeProperty('display'));

        // 增加透明度过度
        // 搜索框?
      };

      document.querySelector('.ytp-panel-header').addEventListener('click', defaultLevel, { once: true });

      window.addEventListener(
        'click',
        () => {
          defaultLevel();
          restartSubtitles();
        },
        { once: true }
      );
      /* window.addEventListener(
        'blur',
        () => {
          defaultLevel();
          restartSubtitles();
        },
        { once: true }
      ); */
    });
  });
};

chrome.storage.local.get(['status', 'single'], ({ status, single }) => {
  localStorage.setItem('singleStatus', single);
  if (status) document.addEventListener('DOMContentLoaded', insertCustomMenu);
});

// window.addEventListener('click', () => {
//   console.log('windwos:click');
// });

// console.log('@@ui_locale', chrome.i18n.getMessage('@@ui_locale'));
// chrome.storage.local.get('selectLang', ({ selectLang }) => {
//   localStorage.setItem('selectLang', selectLang);
// });

//

// window.addEventListener('focus', () => {
//   chrome.storage.local.get('single', ({ single }) => {
//     document.querySelector('#single-button').setAttribute('aria-checked', single);
//   });
// });

// chrome.runtime.onMessage.addListener(({ status }) => {});
// const singleStatus = JSON.parse(this.getAttribute('aria-checked'));

// const settingsButton = document.querySelector('.ytp-button.ytp-settings-button');
// settingsButton.addEventListener('click', () => {
//   window.addEventListener('click', restartSubtitles, { once: true });
// });

// chrome.storage.local.get('single', ({ single }) => {
//   this.setAttribute('aria-checked', !single);
//   chrome.storage.local.set({ single: !single }, restartSubtitles);
// });

// const ytpSettingsMenu = document.querySelector('.ytp-popup.ytp-settings-menu');
