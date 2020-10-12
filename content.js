const injection = handler => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('constant.js');
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
  injection2(`document.querySelector('.html5-video-player').setOption('captions', 'reload', true);`);
};

chrome.runtime.onMessage.addListener(({ status }) => {
  if (status) {
    reboot();
  } else {
    injection2(`XMLHttpRequest.prototype.open = nativeOpen; XMLHttpRequest.prototype.send = nativeSend;`);
    if (JSON.parse(document.body.dataset.captions)) {
      ['#language-button', '#single-button'].forEach(id => document.querySelector(id).remove());
    }
    document.body.removeAttribute('data-captions');
    restartSubtitles();
  }

  audioPlay('assets/2.ogg');
});

const insertCustomMenu = ({ singleStatus, languageParameter }) => {
  const ytpSettingsMenu = document.querySelector('.ytp-popup.ytp-settings-menu');
  const ytpPanel = ytpSettingsMenu.querySelector('.ytp-panel');
  const panelMenu = ytpSettingsMenu.querySelector('.ytp-panel-menu');
  ytpSettingsMenu.addEventListener('click', e => e.stopPropagation());

  panelMenu.insertAdjacentHTML(
    'beforeend',
    `
    <div class="ytp-menuitem" aria-haspopup="true" role="menuitem" tabindex="0" id="language-button">
      <div class="ytp-menuitem-icon"></div>
      <div class="ytp-menuitem-label">${chrome.i18n.getMessage('defaultSubtitles')}</div>
      <div class="ytp-menuitem-content">${languageParameter.languageName}</div>
    </div>

    <div class="ytp-menuitem" role="menuitemcheckbox" aria-checked="${singleStatus}" tabindex="0" id="single-button">
      <div class="ytp-menuitem-icon"></div>
      <div class="ytp-menuitem-label" data-changetrack="false">${chrome.i18n.getMessage('singleSubtitle')}</div>
      <div class="ytp-menuitem-content">
        <div class="ytp-menuitem-toggle-checkbox"></div>
      </div>
    </div>
    `
  );

  ytpSettingsMenu.querySelector('#single-button').addEventListener('click', function () {
    chrome.storage.local.get('singleStatus', ({ singleStatus }) => {
      singleStatus = !singleStatus;
      localStorage.setItem('singleStatus', singleStatus);
      chrome.storage.local.set({ singleStatus });
      this.setAttribute('aria-checked', singleStatus);
      const changeTrack = JSON.parse(document.body.dataset.changetrack || false);

      if (!singleStatus && changeTrack) {
        injection2(`
          document
          .querySelector('.html5-video-player')
          .setOption('captions', 'track', { languageCode: defaultSubtitles });
        `);
      } else {
        restartSubtitles();
      }
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
  };

  ytpSettingsMenu.querySelector('#language-button').addEventListener('click', () => {
    chrome.storage.local.get('languageParameter', ({ languageParameter }) => {
      const levelHeight = ytpSettingsMenu.style.getPropertyValue('height');

      injection2(`
        try {
          localStorage.setItem(
            'autoTranslationList',
            JSON.stringify(document.querySelector('.html5-video-player').getOption('captions', 'translationLanguages') || [])
          );
        } catch {}
      `);

      const autoTranslationList = JSON.parse(localStorage.getItem('autoTranslationList'));

      const list = autoTranslationList
        .map(
          ({ languageCode, languageName }) => `
          <div class="ytp-menuitem" tabindex="0" role="menuitemradio" aria-checked=${
            languageCode === `${languageParameter.languageCode}`
          }>
            <div class="ytp-menuitem-label" data-lang="${languageCode}" data-languagename="${languageName}">
              ${languageName}
            </div>
          </div>`
        )
        .join('');

      let resHeight = Math.round(document.querySelector('.html5-video-player').offsetHeight * 0.7);
      resHeight = resHeight > 414 ? 414 : resHeight;

      const firstElement = `<div class="ytp-menuitem" tabindex="0" role="menuitemradio" style="pointer-events: ${
        list ? 'auto' : 'none'
      };" aria-checked="${`${autoLangCode}` === `${languageParameter.languageCode}`}">
          <div class="ytp-menuitem-label" data-lang="${autoLangCode}" data-languagename="${chrome.i18n.getMessage(
        'auto'
      )}">
            ${chrome.i18n.getMessage(list ? 'auto' : 'goBack')}
          </div>
        </div>`;

      ytpSettingsMenu.insertAdjacentHTML(
        'beforeend',
        `
        <div class="ytp-panel ytp-panel-animate-forward" id="forward" style="min-width: 250px; width: 251px; height: ${resHeight}px;">
          <div class="ytp-panel-header">
            <button class="ytp-button ytp-panel-title">${chrome.i18n.getMessage('defaultSubtitles')}</button>
          </div>
          <div class="ytp-panel-menu" role="menu" id="languageList" style="pointer-events: ${list ? 'auto' : 'none'};">
            ${firstElement}
            ${list}
          </div>
        </div>
        `
      );

      setTimeout(() => {
        ytpSettingsMenu.classList.add('ytp-popup-animating');
        ytpSettingsMenu.style.setProperty('height', `${resHeight}px`);
        [ytpSettingsMenu, ytpPanel].forEach(el => el.style.setProperty('width', `251px`));

        ytpPanel.classList.add('ytp-panel-animate-back');
        ytpSettingsMenu.querySelector('#forward').classList.remove('ytp-panel-animate-forward');
        setTimeout(() => ytpSettingsMenu.classList.remove('ytp-popup-animating'), 280);
      }, 10);

      const defaultLevel = reboot => {
        ytpSettingsMenu.classList.add('ytp-popup-animating');
        ytpSettingsMenu.style.setProperty('height', levelHeight);
        [ytpSettingsMenu, ytpPanel].forEach(el => el.style.setProperty('width', `${panelMenu.offsetWidth}px`));
        ytpSettingsMenu.querySelector('#forward').classList.add('ytp-panel-animate-forward');
        ytpPanel.classList.remove('ytp-panel-animate-back');

        setTimeout(() => {
          ytpSettingsMenu.classList.remove('ytp-popup-animating');
          ytpSettingsMenu.querySelector('#forward').remove();
          reboot && reboot();
        }, 270);
      };

      ytpSettingsMenu
        .querySelector('.ytp-panel-header .ytp-button')
        .addEventListener('click', () => defaultLevel(), { once: true });

      ytpSettingsMenu.querySelector('#languageList').addEventListener('click', function (e) {
        const selectLanguage = {
          languageCode: e.target.dataset.lang.split(','),
          languageName: e.target.dataset.languagename,
        };

        localStorage.setItem('languageParameter', JSON.stringify(selectLanguage));
        chrome.storage.local.set({ languageParameter: selectLanguage });

        [...this.children].forEach(el => el.removeAttribute('aria-checked'));
        e.target.parentElement.setAttribute('aria-checked', true);
        ytpSettingsMenu.querySelector('#language-button .ytp-menuitem-content').textContent =
          selectLanguage.languageName;

        defaultLevel(restartSubtitles);
      });

      ['click', 'blur'].forEach(event => window.addEventListener(event, revertOrigin, { once: true }));
      [...panelMenu.children].forEach(el => el.style.setProperty('white-space', 'nowrap'));
    });
  });
};

const controls = new URLSearchParams(window.location.search).get('controls') !== '0';
const UILang = chrome.i18n.getUILanguage();
const autoLang = new Map(langsRaw).get(UILang);
const autoLangCode = autoLang ? autoLang.languageCode : ['en'];
const languageParameter_ = { languageCode: autoLangCode, languageName: chrome.i18n.getMessage('auto') };

chrome.storage.local.get(null, ({ status, singleStatus, languageParameter = languageParameter_ }) => {
  injection(() => {
    if (status) {
      localStorage.setItem('languageParameter', JSON.stringify(languageParameter));
      localStorage.setItem('singleStatus', singleStatus);
      injection2(`XMLHttpRequest.prototype.open = proxiedOpen; XMLHttpRequest.prototype.send = proxiedSend;`);
      chrome.storage.local.set({ languageParameter });
    }
  });

  if (status && controls) {
    const loadEvent = window.self === window.top ? 'DOMContentLoaded' : 'load';
    window.addEventListener(loadEvent, () => {
      injection2(
        `document.body.dataset.captions = window.self === window.top ? !!ytInitialPlayerResponse.captions : true;`
      );

      const captions = JSON.parse(document.body.dataset.captions);
      if (captions) insertCustomMenu({ singleStatus, languageParameter });
    });
  }
});

const reboot = () => {
  injection2(
    `document.body.dataset.captions = window.self === window.top ? !!ytInitialPlayerResponse.captions : true;`
  );

  const captions = JSON.parse(document.body.dataset.captions);
  if (captions && controls) {
    chrome.storage.local.get(null, ({ singleStatus, languageParameter = languageParameter_ }) => {
      localStorage.setItem('languageParameter', JSON.stringify(languageParameter));
      localStorage.setItem('singleStatus', singleStatus);
      chrome.storage.local.set({ languageParameter });

      injection2(`XMLHttpRequest.prototype.open = proxiedOpen; XMLHttpRequest.prototype.send = proxiedSend;`);
      restartSubtitles();
      insertCustomMenu({ singleStatus, languageParameter });
    });
  }
};
