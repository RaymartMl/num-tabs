type Tab = chrome.tabs.Tab;

const tabs = chrome.tabs;
tabs.onCreated.addListener(() => updateAllTabs());
tabs.onUpdated.addListener(() => updateAllTabs());
tabs.onMoved.addListener(() => updateAllTabs());
tabs.onDetached.addListener(() => updateAllTabs());
tabs.onAttached.addListener(() => updateAllTabs());
tabs.onRemoved.addListener(() => updateAllTabs());

function updateTab(tab: Tab) {
  const { id, index, url, title } = tab;
  if (url.startsWith("chrome://")) {
    return;
  }

  try {
    chrome.scripting
      .executeScript({
        target: { tabId: id },
        func: addTabPrefix,
        args: [index, title],
      })
      .then();
  } catch (e) {
    console.error(e);
  }
}

function addTabPrefix(index: number, title: string) {
  const prefixRegEx = /^[0-9-]+. /g;
  const num = index + 1;

  let newPrefix = `${num}. `;

  console.log({ newPrefix });
  const hasPrefix = prefixRegEx.exec(title);
  if (hasPrefix[0] === newPrefix) {
    return;
  } else if (hasPrefix) {
    // tab moved
    newPrefix += title.split(prefixRegEx)[1];
  } else {
    // new tab
    newPrefix += title;
  }

  document.title = `${newPrefix}`;
}

function getAllTabs(cb: (tabs: Tab[]) => void) {
  chrome.tabs.query({}, cb);
}

function updateAllTabs() {
  const cb = (tabs: Tab[]) => {
    console.log("what is this");
    tabs.forEach((tab) => updateTab(tab));
  };
  getAllTabs(cb);
}
