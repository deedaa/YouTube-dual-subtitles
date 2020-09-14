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
    insertSingle();
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

const insertSingle = () => {
  chrome.storage.local.get('single', ({ single }) => {
    const panelMenu = document.querySelector('.ytp-settings-menu .ytp-panel-menu');
    panelMenu.insertAdjacentHTML(
      'beforeend',
      `
      <div class="ytp-menuitem" aria-haspopup="true" role="menuitem" tabindex="0" id="language-button">
        <div class="ytp-menuitem-icon"></div>
        <div class="ytp-menuitem-label">默认语言</div>
        <div class="ytp-menuitem-content">English</div>
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

    // 每个窗口同步状态
    document.querySelector('.ytp-settings-menu').addEventListener('click', e => {
      console.log('ytp-settings-menu, 停止传播');
      e.stopPropagation();
    });

    document.querySelector('#single-button').addEventListener('click', function () {
      chrome.storage.local.get('single', ({ single }) => {
        this.setAttribute('aria-checked', !single);
        chrome.storage.local.set({ single: !single });
        window.addEventListener('click', restartSubtitles, { once: true });
      });
    });

    document.querySelector('#language-button').addEventListener('click', function (event) {
      // const ytpSettingsMenu = document.querySelector('.ytp-popup.ytp-settings-menu');
      const ytpPanel = document.querySelector('.ytp-settings-menu .ytp-panel');
      [...ytpPanel.children].forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });

      const autoTranslationList = JSON.parse(localStorage.getItem('autoTranslationList'));
      console.log('autoTranslationList: ', autoTranslationList);

      ytpPanel.insertAdjacentHTML(
        'afterbegin',
        `
          <div class="ytp-panel-header defaultLanguage">
            <button class="ytp-button ytp-panel-title">默认语言</button>
          </div>

          <div class="ytp-panel-menu defaultLanguage" role="menu" id="languageList">
            <div class="ytp-menuitem" tabindex="0" role="menuitemradio" aria-checked="true">
              <div class="ytp-menuitem-label">Auto</div>
            </div>
          </div>
        `
      );

      const languageList = document.querySelector('#languageList');
      const selectHandler = languageCode => {
        console.log('lang: ', languageCode);
      };

      autoTranslationList.forEach(el => {
        languageList.insertAdjacentHTML(
          'beforeend',
          `
          <div class="ytp-menuitem" tabindex="0" role="menuitemradio" data-lang="${el.languageCode}">
            <div class="ytp-menuitem-label">${el.languageName.simpleText}</div>
          </div>
          `
        );
      });

      const defaultLevel = () => {
        [...document.querySelectorAll('.defaultLanguage')].forEach(el => el.remove());
        [...ytpPanel.children].forEach(el => el.style.removeProperty('display'));
      };

      window.addEventListener('click', defaultLevel, { once: true });
      window.addEventListener('blur', defaultLevel, { once: true });
      document.querySelector('.ytp-panel-header').addEventListener('click', defaultLevel);

      event.stopPropagation();
    });
  });
};

chrome.storage.local.get(['status', 'single'], ({ status, single }) => {
  localStorage.setItem('singleStatus', single);
  if (status) document.addEventListener('DOMContentLoaded', insertSingle);
});

// window.addEventListener('click', () => {
//   console.log('windwos');
// });

// console.log('@@ui_locale', chrome.i18n.getMessage('@@ui_locale'));
// chrome.storage.local.get('selectLang', ({ selectLang }) => {
//   localStorage.setItem('selectLang', selectLang);
// });

// chrome.storage.local.set('selectLang', ['codeLang']);

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
