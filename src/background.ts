type Tab = chrome.tabs.Tab;

chrome.runtime.onStartup.addListener(updateAllTabs);
chrome.tabs.onCreated.addListener(updateAllTabs);
chrome.tabs.onUpdated.addListener(updateAllTabs);
chrome.tabs.onMoved.addListener(updateAllTabs);
chrome.tabs.onDetached.addListener(updateAllTabs);
chrome.tabs.onAttached.addListener(updateAllTabs);
chrome.tabs.onRemoved.addListener(updateAllTabs);

function updateTab(tab: Tab) {
  const { id, index, url, title } = tab;

  if (url.startsWith("chrome://")) {
    return;
  }

  chrome.scripting.executeScript(
    {
      target: { tabId: id, allFrames: true },
      func: addTabPrefix,
      args: [index, title],
    },
    (a) => {
      if (!chrome.runtime.lastError) {
        return a;
      }
    },
  );
}

function addTabPrefix(index: number, title: string) {
  const prefixRegEx = /^[0-9-]+. /g;
  const num = index + 1;
  let newPrefix = `${num}. `;

  const hasPrefix = prefixRegEx.exec(title);
  if (hasPrefix && hasPrefix[0] === newPrefix) {
    return;
  } else if (hasPrefix) {
    newPrefix += title.split(prefixRegEx)[1];
  } else {
    newPrefix += title;
  }

  document.title = `${newPrefix}`;
}

function getAllTabs(cb: (tabs: Tab[]) => void) {
  chrome.tabs.query({}, cb);
}

function updateAllTabs() {
  const cb = (tabs: Tab[]) => {
    tabs.forEach((tab) => updateTab(tab));
  };
  getAllTabs(cb);
}
