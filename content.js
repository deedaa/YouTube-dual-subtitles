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
    document.querySelector('#language-button').remove();
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
      localStorage.setItem('autoTranslationList', JSON.stringify(autoTranslationList));
    `);

    localStorage.setItem('selectLangCode', JSON.stringify(selectLangCode));
    const ytpSettingsMenu = document.querySelector('.ytp-popup.ytp-settings-menu');
    const ytpPanel = ytpSettingsMenu.querySelector('.ytp-panel');
    const panelMenu = ytpSettingsMenu.querySelector('.ytp-panel-menu');

    ytpSettingsMenu.addEventListener('click', e => e.stopPropagation());

    const langArg = selectLangCode || autoLang.languageCode;
    const autoTranslationList = JSON.parse(localStorage.getItem('autoTranslationList'));
    const { languageName } = autoTranslationList.find(v => v.languageCode === langArg[0]);

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

    ytpSettingsMenu.querySelector('#single-button').addEventListener('click', function () {
      chrome.storage.local.get('single', ({ single }) => {
        this.setAttribute('aria-checked', !single);
        chrome.storage.local.set({ single: !single });
        window.addEventListener('click', restartSubtitles, { once: true });
      });
    });
    // ytp-panel-animate-back   ytp-panel-animate-forward (100%)
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
      // const levelWidth = ytpSettingsMenu.style.getPropertyValue('width');

      const autoTranslationList = JSON.parse(localStorage.getItem('autoTranslationList'));
      const langArg = JSON.parse(localStorage.getItem('selectLangCode')) || autoLang.languageCode;

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
  });
};

chrome.storage.local.get(['status', 'single'], ({ status, single }) => {
  localStorage.setItem('singleStatus', single);
  if (status) document.addEventListener('DOMContentLoaded', insertCustomMenu);
});

// window.addEventListener('click', () => {
//   console.log('windwos:click');
// });

// const singleStatus = JSON.parse(this.getAttribute('aria-checked'));

// .ytp-popup-animating, .ytp-settings-menu { transition: all 2s; }0.25s

// document.body.insertAdjacentHTML(
//   'beforeend',
//   `<style>
//     .ytp-popup-animating { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); pointer-events: auto;}
// </style>`
// );

// 每个窗口同步状态
// window.addEventListener('focus', () => {
//   chrome.storage.local.get('single', ({ single }) => {
//     document.querySelector('#single-button').setAttribute('aria-checked', single);
//   });
// });

// 框架中使用?
