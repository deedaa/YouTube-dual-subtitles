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

chrome.storage.onChanged.addListener(({ status, single }) => {
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
      <div class='ytp-menuitem' role='menuitemcheckbox' aria-checked=${single} tabindex='0' id='single-button'>
        <div class='ytp-menuitem-icon'></div>
        <div class='ytp-menuitem-label'>单字幕</div>
        <div class='ytp-menuitem-content'>
          <div class='ytp-menuitem-toggle-checkbox'></div>
        </div>
      </div>
      `
    );

    window.addEventListener('focus', () => {
      chrome.storage.local.get('single', ({ single }) => {
        document.querySelector('#single-button').setAttribute('aria-checked', single);
      });
    });

    document.querySelector('#single-button').addEventListener('click', function () {
      chrome.storage.local.get('single', ({ single }) => {
        this.setAttribute('aria-checked', !single);
        chrome.storage.local.set({ single: !single }, () => {
          restartSubtitles();
        });
      });
    });
  });
};

chrome.storage.local.get(['status', 'single'], ({ status, single }) => {
  localStorage.setItem('singleStatus', single);

  if (status) {
    document.addEventListener('DOMContentLoaded', () => {
      insertSingle();
      console.log('单字幕已插入');
    });
  }
});

// chrome.runtime.onMessage.addListener(({ status }) => {});
// const singleStatus = JSON.parse(this.getAttribute('aria-checked'));
// localStorage.setItem('singleStatus', !single);
