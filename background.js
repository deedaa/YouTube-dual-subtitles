chrome.runtime.onInstalled.addListener(() =>
  chrome.storage.local.set({
    status: true,
    single: false,
    selectLangCode: null,
    autoLangCode: ['en'],
    autoTranslationList_: null,
  })
);

chrome.tabs.onUpdated.addListener((tabId, status) => {
  chrome.storage.local.get('status', result => {
    if (!result.status && status.status === 'loading') {
      chrome.pageAction.setIcon({ tabId, path: 'assets/disable32.png' });
      // chrome.pageAction.setTitle({ tabId, title: 'YouTube 双字幕\n已关闭 ⚡' });
    }
  });
});

const rule1 = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: { hostEquals: 'www.youtube.com', pathEquals: '/watch' },
    }),
  ],
  actions: [new chrome.declarativeContent.ShowPageAction()],
};

chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
  chrome.declarativeContent.onPageChanged.addRules([rule1]);
});

const setIcon = (tabId, status, title, path) => {
  chrome.storage.local.set({ status: !status }, () => {
    // chrome.pageAction.setTitle({ tabId, title });
    chrome.pageAction.setIcon({ tabId, path });
  });
};

const toggleHandler = ({ id: tabId }) => {
  chrome.storage.local.get('status', ({ status }) => {
    status
      ? setIcon(tabId, status, 'YouTube 双字幕\n已关闭 ⚡', 'assets/disable32.png')
      : setIcon(tabId, status, 'YouTube 双字幕\n已开启 👍', 'assets/32.png');
  });
};

chrome.pageAction.onClicked.addListener(toggleHandler);

chrome.contextMenus.create({
  id: 'issues',
  title: '问题反馈',
  contexts: ['page_action'],
  // onclick: () => chrome.tabs.create({ url: 'https://github.com/ouweiya/YouTube-dual-subtitles/issues/new' }),
});

chrome.contextMenus.create({
  id: 'more',
  title: '了解更多',
  contexts: ['page_action'],
  // onclick: () => chrome.tabs.create({ url: 'https://www.youtube.com/channel/UCY_XK0-kSagJq9ZQspmzd-g?view_as=subscriber' }),
});

chrome.contextMenus.create({
  id: 'github',
  title: 'GitHub',
  contexts: ['page_action'],
  // onclick: () => chrome.tabs.create({ url: 'https://github.com/ouweiya/YouTube-dual-subtitles' }),
});

chrome.contextMenus.onClicked.addListener(({ menuItemId }) => {
  if (menuItemId === 'issues')
    chrome.tabs.create({ url: 'https://github.com/ouweiya/YouTube-dual-subtitles/issues/new' });
  if (menuItemId === 'more')
    chrome.tabs.create({ url: 'https://www.youtube.com/channel/UCY_XK0-kSagJq9ZQspmzd-g?view_as=subscriber' });
  if (menuItemId === 'github') chrome.tabs.create({ url: 'https://github.com/ouweiya/YouTube-dual-subtitles' });
});

// chrome.i18n.getMessage('popup_reportIssues'),
