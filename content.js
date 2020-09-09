const injection = src => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(src);
  (document.head || document.documentElement).append(script);
  // script.onload = () => script.remove();
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

injection('constant.js').onload = () => {
  chrome.storage.local.get('status', ({ status }) => {
    console.log('status222: ', status);
    if (status) {
      injection2(`
        XMLHttpRequest.prototype.open = proxiedOpen;
        XMLHttpRequest.prototype.send = proxiedSend;
      `);

      window.onload = () => {
        let a = document.querySelector('#ytp-id-17 .ytp-panel-menu > div:nth-of-type(1)');
        console.log('a: ', a);
        const panelMenu = document.querySelector('#ytp-id-17 .ytp-panel-menu');
        console.log('panelMenu: ', panelMenu);
        panelMenu.insertAdjacentHTML(
          'beforeend',
          `
          <div class='ytp-menuitem' role='menuitemcheckbox' aria-checked='false' tabindex='0' id='mybtn'>
            <div class='ytp-menuitem-icon'></div>
            <div class='ytp-menuitem-label'>单字幕</div>
            <div class='ytp-menuitem-content'>
              <div class='ytp-menuitem-toggle-checkbox'></div>
            </div>
          </div>
         `
        );

        document.querySelector('#mybtn').onclick = function () {
          console.log('click');
          this.setAttribute('aria-checked', !JSON.parse(this.getAttribute('aria-checked')));
        };
      };
    }
  });
};

chrome.storage.onChanged.addListener(({ status }) => {
  console.log('status: ', status.newValue);
  const subtitlesButton = document.querySelector('.ytp-subtitles-button.ytp-button');

  if (status.newValue) {
    injection2(`
      XMLHttpRequest.prototype.open = proxiedOpen;
      XMLHttpRequest.prototype.send = proxiedSend;
    `);
  } else {
    injection2(`
      XMLHttpRequest.prototype.open = nativeOpen;
      XMLHttpRequest.prototype.send = nativeSend ;
    `);
  }

  audioPlay('assets/2.ogg');

  subtitlesButton.click();
  subtitlesButton.click();
});

// $0.insertAdjacentHTML('beforeend', '<h1>Good</h1>')
// chrome.runtime.onMessage.addListener(({ status }) => {});
