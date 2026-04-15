// Offscreen document for AnyClip clipboard access
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.target !== 'offscreen') return;

  const el = document.getElementById('clip');

  if (msg.action === 'read-clipboard') {
    el.focus();
    document.execCommand('paste');
    sendResponse({ text: el.value });
    el.value = '';
  } else if (msg.action === 'write-clipboard') {
    el.value = msg.text;
    el.select();
    document.execCommand('copy');
    el.value = '';
    sendResponse({ ok: true });
  } else {
    sendResponse({ error: 'unknown action' });
  }
});
