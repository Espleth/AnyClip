// Offscreen document for AnyClip clipboard access
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.target !== 'offscreen') return;

  if (msg.action === 'read-clipboard') {
    const el = document.getElementById('clip');
    el.focus();
    document.execCommand('paste');
    sendResponse({ text: el.value });
    el.value = '';
  }
  if (msg.action === 'write-clipboard') {
    const el = document.getElementById('clip');
    el.value = msg.text;
    el.select();
    document.execCommand('copy');
    el.value = '';
    sendResponse({ ok: true });
  }
});
