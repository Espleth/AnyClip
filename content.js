// Content script for AnyClip
// Runs on every page matched by manifest content_scripts

const TOAST_ICONS = {
  'URL copied': 'icons/copy.svg',
  'URL pasted': 'icons/paste.svg',
  'URL cut': 'icons/cut.svg',
};

function showToast(text) {
  const existing = document.getElementById('anyclip-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'anyclip-toast';

  const iconSrc = TOAST_ICONS[text];
  if (iconSrc) {
    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL(iconSrc);
    Object.assign(icon.style, {
      width: '22px',
      height: '22px',
      marginRight: '10px',
      flexShrink: '0',
      filter: 'brightness(0) invert(1)',
    });
    toast.appendChild(icon);
  }

  const label = document.createElement('span');
  label.textContent = text;
  toast.appendChild(label);

  Object.assign(toast.style, {
    position: 'fixed',
    top: '24px',
    left: '24px',
    display: 'flex',
    alignItems: 'center',
    background: '#1e1e2e',
    color: '#fff',
    padding: '14px 28px',
    borderRadius: '10px',
    fontSize: '18px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    zIndex: '2147483647',
    boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
    pointerEvents: 'none',
    transformOrigin: 'top left',
    transform: 'scaleY(0)',
    opacity: '0',
    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
  });

  document.body.appendChild(toast);

  // Force the browser to paint the initial state before transitioning
  toast.getBoundingClientRect();
  toast.style.transform = 'scaleY(1)';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.transition = 'transform 0.4s cubic-bezier(0.5, 0, 0.75, 0), opacity 0.3s ease';
    toast.style.transform = 'scaleY(0)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 2000);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'show-toast' && msg.text) {
    showToast(msg.text);
  }
});

document.addEventListener('keydown', (e) => {
  const mod = e.ctrlKey || e.metaKey;

  if (mod && e.shiftKey && e.code === 'KeyC') {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast('URL copied'))
      .catch(() => {
        chrome.runtime.sendMessage({ action: 'copy-url' });
      });
  }
}, true);