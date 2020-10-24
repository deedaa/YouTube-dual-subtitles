const restartSubtitles = () => {
  injection2(`document.querySelector('#ytd-player .html5-video-player').setOption('captions', 'reload', true);`);
};

chrome.runtime.onMessage.addListener(({ status }) => {
  if (status) {
    injection2(`XMLHttpRequest.prototype.open = proxiedOpen; XMLHttpRequest.prototype.send = proxiedSend;`);
    ['#language-button', '#single-button'].forEach(id => document.querySelector(id).style.removeProperty('display'));
  } else {
    injection2(`XMLHttpRequest.prototype.open = nativeOpen; XMLHttpRequest.prototype.send = nativeSend;`);
    ['#language-button', '#single-button'].forEach(id =>
      document.querySelector(id).style.setProperty('display', 'none')
    );
  }

  restartSubtitles();
  audioPlay('assets/2.ogg');
});

const insertCustomMenu = ({ singleStatus, languageParameter }) => {
  const ytpSettingsMenu = document.querySelector('#ytd-player .ytp-settings-menu');
  const ytpPanel = ytpSettingsMenu.querySelector('.ytp-panel');
  const panelMenu = ytpSettingsMenu.querySelector('.ytp-panel-menu');

  ytpSettingsMenu.addEventListener('click', e => e.stopPropagation());

  panelMenu.insertAdjacentHTML(
    'beforeend',
    `
    <div class="ytp-menuitem" style="display: none;" aria-haspopup="true" role="menuitem" tabindex="0" id="language-button">
      <div class="ytp-menuitem-icon"></div>
      <div class="ytp-menuitem-label">${chrome.i18n.getMessage('defaultSubtitles')}</div>
      <div class="ytp-menuitem-content">${languageParameter.languageName}</div>
    </div>

    <div class="ytp-menuitem" style="display: none;" role="menuitemcheckbox" aria-checked="${singleStatus}" tabindex="0" id="single-button">
      <div class="ytp-menuitem-icon"></div>
      <div class="ytp-menuitem-label" data-changetrack="false">${chrome.i18n.getMessage('singleSubtitle')}</div>
      <div class="ytp-menuitem-content">
        <div class="ytp-menuitem-toggle-checkbox"></div>
      </div>
    </div>
    `
  );

  document.querySelector('#ytd-player .ytp-settings-button').addEventListener('mouseenter', () => {
    chrome.storage.local.get(null, ({ status }) => {
      if (!status) return;
      const captions = document.querySelector(`#ytd-player .ytp-subtitles-button`).offsetWidth;

      if (captions) {
        ['#language-button', '#single-button'].forEach(id =>
          document.querySelector(id).style.removeProperty('display')
        );
      } else {
        ['#language-button', '#single-button'].forEach(id =>
          document.querySelector(id).style.setProperty('display', 'none')
        );
      }
    });
  });

  ytpSettingsMenu.querySelector('#single-button').addEventListener('click', function () {
    chrome.storage.local.get('singleStatus', ({ singleStatus }) => {
      singleStatus = !singleStatus;
      localStorage.setItem('singleStatus', singleStatus);
      chrome.storage.local.set({ singleStatus });
      this.setAttribute('aria-checked', singleStatus);
      restartSubtitles();
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
            JSON.stringify(document.querySelector('#ytd-player .html5-video-player').getOption('captions', 'translationLanguages') || [])
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

      let resHeight = Math.round(document.querySelector('#ytd-player .html5-video-player').offsetHeight * 0.7);
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

chrome.storage.local.get(null, ({ singleStatus, languageParameter = languageParameter_ }) => {
  document.querySelector('ytd-player#ytd-player').dataset.content_ = true;
  if (controls) insertCustomMenu({ singleStatus, languageParameter });
});

console.log('注入了');

// iframe 的植入时机

// const changeTrack = JSON.parse(document.body.dataset.changetrack || false);
/* if (!singleStatus && changeTrack) {
        console.log('关闭字幕');
        injection2(`
          console.log(222, defaultSubtitles );
          document
          .querySelector('#ytd-player .html5-video-player')
          .setOption('captions', 'track', { languageCode: defaultSubtitles });
        `);
      } else {
        console.log('字幕重启');
        injection2(`
          defaultSubtitles = document.querySelector('#ytd-player .html5-video-player').getOption('captions', 'track').languageCode;
        `);
        restartSubtitles();
      } */

// reboot();

// ['#language-button', '#single-button'].forEach(id => document.querySelector(id).remove());
// document.body.removeAttribute('data-captions');
// 'important'

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

// const UILang = chrome.i18n.getUILanguage();
// const autoLang = new Map(langsRaw).get(UILang);
// const autoLangCode = autoLang ? autoLang.languageCode : ['en'];
// const languageParameter_ = { languageCode: autoLangCode, languageName: chrome.i18n.getMessage('auto') };
// const controls = new URLSearchParams(window.location.search).get('controls') !== '0';

// const reboot = () => {
//   chrome.storage.local.get(null, ({ singleStatus, languageParameter = languageParameter_ }) => {
//     localStorage.setItem('languageParameter', JSON.stringify(languageParameter));
//     localStorage.setItem('singleStatus', singleStatus);
//     chrome.storage.local.set({ languageParameter });

//     injection2(`XMLHttpRequest.prototype.open = proxiedOpen; XMLHttpRequest.prototype.send = proxiedSend;`);
//     restartSubtitles();

//     if (controls) insertCustomMenu({ singleStatus, languageParameter });
//   });
// };

// window.addEventListener('hashchange', function (e) {
//   console.log('hash changed');
// });
// window.addEventListener('popstate', function (e) {
//   console.log('url changed');
// });

// console.log(chrome.tabs);

/* if (status && controls) {
    const loadEvent = window.self === window.top ? 'DOMContentLoaded' : 'load';
    window.addEventListener(loadEvent, () => {
      injection2(
        `document.body.dataset.captions = window.self === window.top ? !!ytInitialPlayerResponse.captions : true;`
      );

      const captions = JSON.parse(document.body.dataset.captions);
      if (captions) insertCustomMenu({ singleStatus, languageParameter });
    });
  } */

// document.querySelector('html').dataset.content_ = true;

// injection(() => {
//   if (status) {
//     localStorage.setItem('languageParameter', JSON.stringify(languageParameter));
//     localStorage.setItem('singleStatus', singleStatus);
//     injection2(`XMLHttpRequest.prototype.open = proxiedOpen; XMLHttpRequest.prototype.send = proxiedSend;`);
//     chrome.storage.local.set({ languageParameter });
//   }
// });

// injection2(
//   `document.body.dataset.captions = window.self === window.top ? !!ytInitialPlayerResponse.captions : true;`
// );

// const captions = JSON.parse(document.body.dataset.captions);
// captions &&
// if (JSON.parse(document.body.dataset.captions)) { }

// injection2(
//   `document.body.dataset.captions = window.self === window.top ? !!ytInitialPlayerResponse.captions : true;`
// );
// const captions = JSON.parse(document.body.dataset.captions);

// document.querySelector(`#ytd-player .ytp-subtitles-button:not([style='true'])`)
// getPropertyValue('display')

// setTimeout(() => {
//   const windowList = [...document.querySelectorAll('.html5-video-player')]
//     .map(el => ({ parent: el, settingButton: el.querySelector('.ytp-settings-button') }))
//     .filter(v => v.settingButton);

//   console.log('windowList: ', windowList);
//   windowList.forEach(v =>
//     v.settingButton.addEventListener(
//       'mouseenter',
//       () => {
//         console.log('设置按钮');
//       }
//       // { once: true }
//     )
//   );
// }, 4000);
// #ytd-player .ytp-settings-button

// const stopPropagation = e => e.stopPropagation();
