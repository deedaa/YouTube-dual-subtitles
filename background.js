const conditions = [
  { pageUrl: { hostEquals: 'www.youtube.com', pathEquals: '/watch' } },
  { css: [`iframe[src*='www.youtube.com/embed']`] },
  { css: [`iframe[src*='www.youtube-nocookie.com/embed']`] },
].map(entry => new chrome.declarativeContent.PageStateMatcher(entry));

const rule1 = { id: 'showAction', conditions, actions: [new chrome.declarativeContent.ShowPageAction()] };
const rule2 = {
  id: 'hideAction',
  conditions,
  actions: [new chrome.declarativeContent.SetIcon({ path: 'assets/disable16.png' })],
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ status: true, singleStatus: false });
  [
    { id: 'issues', title: chrome.i18n.getMessage('feedback') },
    { id: 'more', title: chrome.i18n.getMessage('learnMore') },
    { id: 'github', title: 'GitHub' },
  ].forEach(entry => chrome.contextMenus.create({ ...entry, contexts: ['page_action'] }));

  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([rule1]);
  });
});

chrome.pageAction.onClicked.addListener(({ id }) => {
  chrome.storage.local.get('status', ({ status }) => {
    status = !status;
    chrome.storage.local.set({ status }, () => {
      if (status) {
        chrome.declarativeContent.onPageChanged.removeRules(['hideAction']);
      } else {
        chrome.declarativeContent.onPageChanged.addRules([rule2]);
      }

      chrome.tabs.sendMessage(id, { status });
    });
  });
});

chrome.contextMenus.onClicked.addListener(({ menuItemId }) => {
  if (menuItemId === 'issues')
    chrome.tabs.create({ url: 'https://github.com/ouweiya/YouTube-dual-subtitles/issues/new' });
  if (menuItemId === 'more') chrome.tabs.create({ url: 'http://youtube.material-ui-china.com' });
  if (menuItemId === 'github') chrome.tabs.create({ url: 'https://github.com/ouweiya/YouTube-dual-subtitles' });
});
