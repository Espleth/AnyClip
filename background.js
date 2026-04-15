// Background service worker for AnyClip

chrome.runtime.onInstalled.addListener(() => {
  console.log('AnyClip installed');
});

async function ensureOffscreen() {
  const existing = await chrome.offscreen.hasDocument();
  if (!existing) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['CLIPBOARD'],
      justification: 'Read/write clipboard for AnyClip shortcuts',
    });
  }
}

async function readClipboard() {
  await ensureOffscreen();
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'read-clipboard', target: 'offscreen' }, (resp) => {
      resolve(resp?.text ?? '');
    });
  });
}

async function writeClipboard(text) {
  await ensureOffscreen();
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'write-clipboard', target: 'offscreen', text }, () => {
      resolve();
    });
  });
}

async function showToastInTab(tabId, text) {
  try {
    await chrome.tabs.sendMessage(tabId, { action: 'show-toast', text });
  } catch {
    // Tab may not have content script (e.g. chrome:// pages)
  }
}

async function copyUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;
  await writeClipboard(tab.url);
  showToastInTab(tab.id, 'URL copied');
}

async function copyUrlAndClose() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;
  await writeClipboard(tab.url);
  await chrome.tabs.remove(tab.id);

  // Show toast on the tab that becomes active after closing
  const [next] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (next && !/^chrome:\/\/newtab/i.test(next.url || '')) {
    showToastInTab(next.id, 'URL cut');
  }
}

function textToUrl(text) {
  if (/^(https?|chrome|chrome-extension|file|about):\/\//i.test(text)) {
    return text;
  }
  if (text.includes('.')) {
    return 'https://' + text;
  }
  return 'https://www.google.com/search?q=' + encodeURIComponent(text);
}

async function pasteAndGo() {
  const text = (await readClipboard()).trim();
  if (!text) return;

  const tab = await chrome.tabs.create({ url: textToUrl(text) });

  // Show toast once the new tab has finished loading
  const onUpdated = (tabId, info) => {
    if (tabId === tab.id && info.status === 'complete') {
      chrome.tabs.onUpdated.removeListener(onUpdated);
      showToastInTab(tabId, 'URL pasted');
    }
  };
  chrome.tabs.onUpdated.addListener(onUpdated);
}

chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'copy-url': return copyUrl();
    case 'copy-url-and-close': return copyUrlAndClose();
    case 'paste-and-go': return pasteAndGo();
  }
});

// Handle messages forwarded from content script (fallback when Chrome command doesn't fire)
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.target === 'offscreen') return; // handled by offscreen.js
  switch (msg.action) {
    case 'copy-url': copyUrl(); break;
    case 'copy-url-and-close': copyUrlAndClose(); break;
  }
});
