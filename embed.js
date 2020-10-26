const i18nGet = chrome.i18n.getMessage;

const insertCustomMenu = ({ singleStatus, languageParameter }) => {
  const ytpSettingsMenu = document.querySelector('#player .ytp-settings-menu');
  const ytpPanel = ytpSettingsMenu.querySelector('.ytp-panel');
  const panelMenu = ytpSettingsMenu.querySelector('.ytp-panel-menu');

  ytpSettingsMenu.addEventListener('click', e => e.stopPropagation());

  panelMenu.insertAdjacentHTML(
    'beforeend',
    `
    <div class="ytp-menuitem" style="display: none;" aria-haspopup="true" role="menuitem" tabindex="0" id="language-button">
      <div class="ytp-menuitem-icon"></div>
      <div class="ytp-menuitem-label">${i18nGet('defaultSubtitles')}</div>
      <div class="ytp-menuitem-content">${languageParameter.languageName}</div>
    </div>

    <div class="ytp-menuitem" style="display: none;" role="menuitemcheckbox" aria-checked="${singleStatus}" tabindex="0" id="single-button">
      <div class="ytp-menuitem-icon"></div>
      <div class="ytp-menuitem-label" data-changetrack="false">${i18nGet('singleSubtitle')}</div>
      <div class="ytp-menuitem-content">
        <div class="ytp-menuitem-toggle-checkbox"></div>
      </div>
    </div>
    `
  );

  document.querySelector('#player .ytp-settings-button').addEventListener('mouseenter', () => {
    chrome.storage.local.get(null, ({ status }) => {
      const subtitles = document.querySelector(`#player .ytp-subtitles-button`).offsetWidth;
      if (status && subtitles) {
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
    console.log('revertOrigin: ');
    const eventType = e.type === 'blur' ? 'click' : 'blur';
    window.removeEventListener(eventType, revertOrigin);

    setTimeout(() => {
      const forward = ytpSettingsMenu.querySelector('#forward');
      forward && forward.remove();
      ytpPanel.classList.remove('ytp-panel-animate-back');
    }, 200);
  };

  ytpSettingsMenu.querySelector('#language-button').addEventListener('click', () => {
    chrome.storage.local.get(['languageParameter', 'autoLangCode'], ({ languageParameter, autoLangCode }) => {
      const levelHeight = ytpSettingsMenu.style.getPropertyValue('height');

      injection2(`
        try {
          localStorage.setItem(
            'autoTranslationList',
            JSON.stringify(document.querySelector('#player .html5-video-player').getOption('captions', 'translationLanguages') || [])
          );
        } catch {}
      `);

      const autoTranslationList = JSON.parse(localStorage.getItem('autoTranslationList'));

      const list = autoTranslationList
        .map(
          ({ languageCode, languageName }) => `
          <div class="ytp-menuitem" tabindex="0" role="menuitemradio" aria-checked=${
            languageCode === languageParameter.languageCode[0] && languageParameter.auto !== 'true'
          }>
            <div class="ytp-menuitem-label" data-lang="${languageCode}" data-languagename="${languageName}">
              ${languageName}
            </div>
          </div>`
        )
        .join('');

      let resHeight = Math.round(document.querySelector('#player .html5-video-player').offsetHeight * 0.7);
      resHeight = resHeight > 414 ? 414 : resHeight;

      const firstElement = `<div class="ytp-menuitem" tabindex="0" role="menuitemradio" style="pointer-events: ${
        list ? 'auto' : 'none'
      };" aria-checked="${languageParameter.auto === 'true'}">
          <div class="ytp-menuitem-label" data-lang="${autoLangCode}" data-languagename="${i18nGet(
        'auto'
      )}" data-auto="true">
            ${i18nGet(list ? 'auto' : 'goBack')}
          </div>
        </div>`;

      ytpSettingsMenu.insertAdjacentHTML(
        'beforeend',
        `
        <div class="ytp-panel ytp-panel-animate-forward" id="forward" style="min-width: 250px; width: 251px; height: ${resHeight}px;">
          <div class="ytp-panel-header">
            <button class="ytp-button ytp-panel-title">${i18nGet('defaultSubtitles')}</button>
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
        const languageParameter = {
          languageCode: e.target.dataset.lang.split(','),
          languageName: e.target.dataset.languagename,
          auto: e.target.dataset.auto,
        };

        localStorage.setItem('languageParameter', JSON.stringify(languageParameter));
        chrome.storage.local.set({ languageParameter });

        [...this.children].forEach(el => el.removeAttribute('aria-checked'));
        e.target.parentElement.setAttribute('aria-checked', true);
        ytpSettingsMenu.querySelector('#language-button .ytp-menuitem-content').textContent =
          languageParameter.languageName;

        defaultLevel(restartSubtitles);
      });

      ['click', 'blur'].forEach(event => window.addEventListener(event, revertOrigin, { once: true }));
      [...panelMenu.children].forEach(el => el.style.setProperty('white-space', 'nowrap'));
    });
  });
};

const controls = new URLSearchParams(window.location.search).get('controls') !== '0';

chrome.storage.local.get(null, ({ singleStatus, languageParameter }) => {
  if (controls) insertCustomMenu({ singleStatus, languageParameter });
});

console.log('embed 注入了');
