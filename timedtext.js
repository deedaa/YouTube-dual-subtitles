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

chrome.storage.local.get(null, ({ status, singleStatus, languageParameter = languageParameter_ }) => {
  injection(() => {
    if (status) {
      localStorage.setItem('languageParameter', JSON.stringify(languageParameter));
      localStorage.setItem('singleStatus', singleStatus);
      injection2(`XMLHttpRequest.prototype.open = proxiedOpen; XMLHttpRequest.prototype.send = proxiedSend;`);
      chrome.storage.local.set({ languageParameter });
    }
  });
});
