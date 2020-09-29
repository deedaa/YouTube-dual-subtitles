chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ status: true, singleStatus: false });
});

chrome.tabs.onUpdated.addListener((tabId, status) => {
  chrome.storage.local.get('status', result => {
    if (!result.status && status.status === 'loading') {
      chrome.pageAction.setIcon({ tabId, path: 'assets/disable32.png' });
    }
  });
});

const rule1 = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: { hostEquals: 'www.youtube.com', pathEquals: '/watch' },
    }),
    new chrome.declarativeContent.PageStateMatcher({
      css: [`iframe[src*='www.youtube.com/embed']`],
    }),
    new chrome.declarativeContent.PageStateMatcher({
      css: [`iframe[src*='www.youtube-nocookie.com/embed']`],
    }),
  ],
  actions: [new chrome.declarativeContent.ShowPageAction()],
};

chrome.declarativeContent.onPageChanged.removeRules(undefined, () =>
  chrome.declarativeContent.onPageChanged.addRules([rule1])
);

const setIcon = (tabId, status, path) => {
  chrome.storage.local.set({ status: !status }, () => chrome.pageAction.setIcon({ tabId, path }));
};

const toggleHandler = ({ id: tabId }) => {
  chrome.storage.local.get('status', ({ status }) => {
    status ? setIcon(tabId, status, 'assets/disable32.png') : setIcon(tabId, status, 'assets/32.png');
  });
};

chrome.pageAction.onClicked.addListener(toggleHandler);

chrome.contextMenus.create({
  id: 'issues',
  title: chrome.i18n.getMessage('feedback'),
  contexts: ['page_action'],
});

chrome.contextMenus.create({
  id: 'more',
  title: chrome.i18n.getMessage('learnMore'),
  contexts: ['page_action'],
});

chrome.contextMenus.create({
  id: 'github',
  title: 'GitHub',
  contexts: ['page_action'],
});

chrome.contextMenus.onClicked.addListener(({ menuItemId }) => {
  if (menuItemId === 'issues')
    chrome.tabs.create({ url: 'https://github.com/ouweiya/YouTube-dual-subtitles/issues/new' });
  if (menuItemId === 'more')
    chrome.tabs.create({ url: 'https://www.youtube.com/channel/UCY_XK0-kSagJq9ZQspmzd-g?view_as=subscriber' });
  if (menuItemId === 'github') chrome.tabs.create({ url: 'https://github.com/ouweiya/YouTube-dual-subtitles' });
});
