chrome.runtime.onInstalled.addListener(() => chrome.storage.local.set({ status: true, single: false }));

chrome.tabs.onUpdated.addListener((tabId, status) => {
  chrome.storage.local.get('status', result => {
    if (!result.status && status.status === 'loading') {
      chrome.pageAction.setIcon({ tabId, path: 'assets/disable32.png' });
      chrome.pageAction.setTitle({ tabId, title: 'YouTube 双字幕\n已关闭 ⚡' });
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
    chrome.pageAction.setTitle({ tabId, title });
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

// chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
//   chrome.tabs.sendMessage(tabs[0].id, { status: !status });
// });
